#!/bin/sh
set -eu

# Complete the host-side steps that cannot be encoded in an unprivileged
# release archive: setuid Electron sandbox ownership, install the signed
# WebBridge CRX policy for browsers present on the host, and grant the logged-in
# user access to evdev keyboard devices for explicit shortcut recording.

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
if [ -f "$SCRIPT_DIR/chrome-sandbox" ]; then
  ROOT=$SCRIPT_DIR
else
  ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
fi
CRX="$ROOT/resources/resources/webbridge-extension/fldmhceldgbpfpkbgopacenieobmligc.crx"
SANDBOX="$ROOT/chrome-sandbox"
EXTENSION_ID=fldmhceldgbpfpkbgopacenieobmligc
EXTENSION_VERSION=1.11.6
TARGET_USER=${SUDO_USER:-${USER:-}}
INSTALL_DEPENDENCIES=0
for argument in "$@"; do
  case "$argument" in
    --install-dependencies) INSTALL_DEPENDENCIES=1;;
    --help|-h)
      printf '%s\n' 'Usage: configure-linux-host.sh [--install-dependencies]'
      printf '%s\n' '  --install-dependencies  install native host packages with the detected distro package manager'
      exit 0
      ;;
    *) printf 'unknown option: %s\n' "$argument" >&2; exit 64;;
  esac
done

OS_ID=unknown
OS_LIKE=
if [ -r /etc/os-release ]; then
  # shellcheck disable=SC1091
  . /etc/os-release
  OS_ID=${ID:-unknown}
  OS_LIKE=${ID_LIKE:-}
fi

if [ "$(id -u)" -ne 0 ]; then
  command -v sudo >/dev/null 2>&1 || { printf '%s\n' 'configure-linux-host.sh requires root or sudo.' >&2; exit 77; }
  exec sudo -- "$0" "$@"
fi

[ -f "$CRX" ] || { printf 'WebBridge CRX is missing: %s\n' "$CRX" >&2; exit 66; }
[ -f "$SANDBOX" ] || { printf 'Electron sandbox is missing: %s\n' "$SANDBOX" >&2; exit 66; }

chown root:root "$SANDBOX"
chmod 4755 "$SANDBOX"

install_dependencies() {
  [ "$INSTALL_DEPENDENCIES" -eq 1 ] || return 0
  has_family() {
    case " $OS_ID $OS_LIKE " in *" $1 "*) return 0;; *) return 1;; esac
  }
  if has_family arch; then
      command -v pacman >/dev/null 2>&1 || { printf '%s\n' 'pacman is not available on this Arch-like host; install the listed packages manually.' >&2; return 0; }
      pacman -S --needed --noconfirm chromium tesseract tesseract-data-eng tesseract-data-chi_sim tesseract-data-chi_tra xdotool grim scrot imagemagick xdg-desktop-portal
  elif has_family debian || has_family ubuntu; then
      command -v apt-get >/dev/null 2>&1 || { printf '%s\n' 'apt-get is not available on this Debian-like host; install the listed packages manually.' >&2; return 0; }
      apt-get update
      DEBIAN_FRONTEND=noninteractive apt-get install -y chromium tesseract-ocr tesseract-ocr-eng tesseract-ocr-chi-sim tesseract-ocr-chi-tra xdotool grim scrot imagemagick xdg-desktop-portal
  elif has_family fedora || has_family rhel; then
      command -v dnf >/dev/null 2>&1 || { printf '%s\n' 'dnf is not available on this Fedora-like host; install the listed packages manually.' >&2; return 0; }
      dnf install -y chromium tesseract tesseract-langpack-eng tesseract-langpack-chi_sim tesseract-langpack-chi_tra xdotool grim scrot ImageMagick xdg-desktop-portal
  elif has_family opensuse || has_family suse; then
      command -v zypper >/dev/null 2>&1 || { printf '%s\n' 'zypper is not available on this SUSE-like host; install the listed packages manually.' >&2; return 0; }
      zypper --non-interactive install chromium tesseract-ocr xdotool grim scrot ImageMagick xdg-desktop-portal
  elif has_family alpine; then
      command -v apk >/dev/null 2>&1 || { printf '%s\n' 'apk is not available on this Alpine host; install the listed packages manually.' >&2; return 0; }
      apk add chromium tesseract-ocr tesseract-ocr-data-eng tesseract-ocr-data-chi_sim tesseract-ocr-data-chi_tra xdotool grim scrot imagemagick xdg-desktop-portal
  else
      printf 'No package recipe for distro %s (ID_LIKE=%s); install Chromium, Tesseract, portal, and X11 packages manually.\n' "$OS_ID" "$OS_LIKE" >&2
  fi
}

install_dependencies

write_policy() {
  directory=$1
  policy="$directory/$EXTENSION_ID.json"
  payload="$directory/$EXTENSION_ID.crx"
  install -d -o root -g root -m 0755 "$directory"
  install -o root -g root -m 0644 "$CRX" "$payload"
  temporary="$policy.tmp.$$"
  printf '{"external_crx":"%s","external_version":"%s"}\n' "$payload" "$EXTENSION_VERSION" > "$temporary"
  chown root:root "$temporary"
  chmod 0644 "$temporary"
  mv -f "$temporary" "$policy"
}

installed_browsers=
if command -v chromium >/dev/null 2>&1 || [ -x /usr/bin/chromium ]; then
  write_policy /usr/share/chromium/extensions
  installed_browsers="${installed_browsers}chromium "
fi
if command -v brave >/dev/null 2>&1 || command -v brave-browser >/dev/null 2>&1; then
  if [ -d /opt/brave.com/brave ]; then write_policy /opt/brave.com/brave/extensions; else write_policy /usr/share/brave/extensions; fi
  installed_browsers="${installed_browsers}brave "
fi
if command -v vivaldi >/dev/null 2>&1 || command -v vivaldi-stable >/dev/null 2>&1; then
  if [ -d /opt/vivaldi ]; then write_policy /opt/vivaldi/extensions; else write_policy /usr/share/vivaldi/extensions; fi
  installed_browsers="${installed_browsers}vivaldi "
fi
if command -v google-chrome >/dev/null 2>&1 || command -v google-chrome-stable >/dev/null 2>&1; then
  if [ -d /opt/google/chrome ]; then write_policy /opt/google/chrome/extensions; else write_policy /usr/share/google-chrome/extensions; fi
  installed_browsers="${installed_browsers}chrome "
fi
if command -v microsoft-edge >/dev/null 2>&1 || command -v microsoft-edge-stable >/dev/null 2>&1; then
  if [ -d /opt/microsoft/msedge ]; then write_policy /opt/microsoft/msedge/extensions; else write_policy /usr/share/microsoft-edge/extensions; fi
  installed_browsers="${installed_browsers}edge "
fi

if [ -n "$TARGET_USER" ] && getent passwd "$TARGET_USER" >/dev/null 2>&1 && getent group input >/dev/null 2>&1; then
  usermod -aG input "$TARGET_USER"
fi

printf 'sandbox=%s\n' "$(stat -c '%U:%G %a' "$SANDBOX")"
printf 'webbridge_browsers=%s\n' "${installed_browsers:-none}"
if command -v tesseract >/dev/null 2>&1; then
  printf 'tesseract=%s\n' "$(tesseract --version 2>&1 | sed -n '1p')"
else
  printf '%s\n' 'tesseract=missing (install tesseract and the required tessdata packages)'
fi
if [ -n "$TARGET_USER" ] && id -nG "$TARGET_USER" | tr ' ' '\n' | grep -qx input; then
  printf 'evdev_group=%s\n' "$TARGET_USER:input (re-login required)"
else
  printf '%s\n' 'evdev_group=not configured'
fi
