# Distribution support and host contract

The client is a Linux/POSIX build, not a Windows binary under Wine. The
JavaScript and native adapter layer uses POSIX paths, Unix sockets, evdev,
X11/XTest, Wayland portals, and Chromium-family browser policies.

## Supported host families

The release host configurator has recipes for:

* Arch, Manjaro, and EndeavourOS (`pacman`)
* Debian, Ubuntu, Linux Mint, and Pop (`apt`)
* Fedora, RHEL, CentOS, Rocky, and Alma (`dnf`)
* openSUSE and SLES (`zypper`)
* Alpine (`apk`)

Run the configurator from the generated release directory:

```sh
./configure-linux-host.sh --install-dependencies
./check-linux-host.mjs --strict
```

The first command is idempotent. It installs the browser/OCR/screenshot
facilities that are available under the detected package manager, installs the
signed WebBridge CRX policy for browsers found on the host, adds the desktop
user to the `input` group, and sets `chrome-sandbox` to root-owned mode 4755.
The second command emits a machine-readable receipt and fails before launch if
the libc, Electron dependencies, sandbox, or other required ABI checks are not
met.

## ABI boundary

The supplied Electron 43 and Kimi Slides Linux payloads are glibc x86-64
artifacts. They are native Linux executables and work across glibc
distributions when their GTK/GBM/X11/Wayland dependencies are present. A musl
distribution (for example Alpine without a compatibility layer), a non-x86-64
architecture, or a host with incompatible vendor payloads requires a separate
Electron/runtime/CLI build for that ABI. The checker reports this as a blocker;
it never pretends that a glibc executable is portable to musl.

## Browser policy paths

The configurator installs a policy and a root-readable CRX copy for each
detected browser family. Chromium uses `/usr/share/chromium/extensions`, Google
Chrome uses `/opt/google/chrome/extensions` or its `/usr/share` equivalent,
Microsoft Edge uses `/opt/microsoft/msedge/extensions` or its `/usr/share`
equivalent, and Brave/Vivaldi use their vendor installation directories. The
unpacked extension includes the signed CRX public key, so manual development
loads retain the production extension ID and loopback-origin check.
