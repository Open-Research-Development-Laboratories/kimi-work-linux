# Kimi Work Linux/POSIX port

This directory is the source-first Linux port of the supplied Kimi Work 3.2.7
Windows bundle. The original files under `../app-64` are kept unchanged. The
POSIX adapters are distribution-neutral; the host configurator contains
package recipes for the common Linux families and the capability checker
rejects an ABI it cannot satisfy instead of silently falling back to Wine. The
port is built into `linux-port/dist/kimi-work-linux-x64` by extracting the
JavaScript archives, packing the patched app as `resources/app.asar`, adding
Linux native adapters, rebuilding the daemon's native dependencies against
Node 24.15.0, embedding CPython 3.12.14, and copying the matching Electron
43.6.0 runtime.

## What was present in the supplied artifact

| Surface | Windows evidence | Linux treatment |
| --- | --- | --- |
| Electron shell | `app-64/Kimi.exe` (Electron 43.6.0, Node 24.20.0) | Electron 43.6.0 Linux runtime; patched `resources/app.asar` plus an `app.asar.unpacked` native boundary; launcher sets `ELECTRON_FORCE_IS_PACKAGED=1` so the vendor packaged-resource resolver is used |
| Main native addons | eight PE `.node` files under `app.asar.unpacked/out/native/win32-x64` | CommonJS POSIX adapters under `out/native/linux-x64`: keyboard environment, global hotkey, Unix-domain IPC, screenshot, OCR, scroll input, file-manager selection, and focus shim |
| Daimon | `daimon-bundle.tar.gz` marked `win32-x64`; Windows Python/uv/Git and PE `better_sqlite3.node` | first-party JS retained; Windows payloads removed; `better-sqlite3` rebuilt as ELF for Node ABI 137; `node-pty` uses Linux N-API build; bundled CPython 3.12.14 plus system Git/uv on Linux; bundle lives at `resources/resources/daimon-bundle` to match the packaged resolver |
| Gateway | `gateway.asar` with Windows optional packages | Linux optional packages are installed at the pinned versions and kept outside ASAR; all PE/DLL/PDB payloads are removed |
| Auxiliary helpers | `kimi-webbridge.exe`, `kimiim-cli.exe`, `elevate.exe` | a first-party POSIX WebBridge daemon (`kimi-webbridge` plus loopback HTTP/WebSocket protocol), the pinned CRX, and an unpacked extension tree are shipped for Linux; the group-chat `kimiim` CLI is replaced by a pinned Linux ELF and its three bundled skills; no PE helper or Wine fallback is used |
| Kimi Slides | `kimi-slides.exe` (Rust CLI) | pinned official Linux x64 ELF `kimi-slides` 2.2.15 (`926985a4`) is downloaded with SHA-256 verification and released at `resources/resources/kimi-slides`; the same binary is staged in the development target tree |

Linux also ships a native POSIX Computer Use bridge at
`resources/resources/kimi-cu` (and `~/.local/bin/kimi-cu` after installation).
Its MCP entry point is `kimi-cu mcp -s user`; the Linux configuration must not
refer to the macOS-only `/Applications/KimiCU.app/Contents/MacOS/kimi-cu`
path.

The release also preserves the desktop-managed built-in skill channel from the
macOS distribution at `resources/resources/builtin-skills`: `kimi-webmcp` and
`kimi-model-annotations` (including the model-annotation data-format reference)
are hash-recorded in `linux-port-manifest.json` and checked by the verifier.
The platform-neutral `resources/resources/build-config.json` and the
Linux-matching `resources/resources/kimi-webbridge.bundle-version` marker are
also shipped and manifest-verified; the newer macOS 3.2.8 marker is `v2.0.9`,
while this x86-64 Linux daemon is intentionally and truthfully `v2.0.8`.

The web UI, authentication, network transport, protocol handlers, updater
selection, Kimi Slides CLI, group-chat kimiim CLI, WebBridge loopback service,
and OpenClaw gateway JavaScript are platform-neutral or have Linux replacements
in the port. The supplied run log showed the web shell reaching
`Ready, loadURL mode`; its authenticated requests depend on the account/session
available at run time. The blocking failures reproduced from that log were the
missing Linux native addons and the Windows-only Daimon bundle path.

## Build

Build is intentionally staged and atomic. It refuses to overwrite an existing
output unless `--force` is supplied. Required tools are `tar`, `curl`, `unzip`,
`uv`, `npm`, a C/C++ toolchain, and the Electron `asar` CLI. Set `ASAR_BIN` and
`ELECTRON_ROOT` when the host paths differ from the defaults.

```sh
cd /devops/projects/external/kimi-work/linux-port
npm test
ASAR_BIN=/path/to/asar ELECTRON_ROOT=/usr/lib/electron43 npm run build
./dist/kimi-work-linux-x64/configure-linux-host.sh
npm run verify
```

The build downloads Node `v24.15.0` for `linux-x64` and verifies this SHA-256
before using it:

```
472655581fb851559730c48763e0c9d3bc25975c59d518003fc0849d3e4ba0f6
```

It installs CPython `3.12.14` with the host `uv` downloader (no host
`python3` is assumed), removes Windows-only standard-library payloads, and
records the resulting interpreter hash. Kimi Slides is fetched from the pinned
Moonshot static asset and verified with:

```
https://statics.moonshot.cn/kimi-ppt-cli-native-inside/2.2.15/926985a4/kimi-slides-linux-x64.zip
cae4e8d60f50acf3e01c45608ccc4d04ecda079298474816d8b7d9da008d6562
```

The group-chat CLI is fetched as a Linux ELF from the pinned Moonshot asset and
verified before release:

```
https://kimi-img.moonshot.cn/pub/claw/tmp/lihuaru/skills/kimiim/kimiim-cli
4bfd177762cab9f6e3fae38f0ee59cd4d97da98a584f68406fed7a4d28b0df26
```

The Browser Extension payload is retained from the supplied release and
verified before staging:

```
resources/resources/webbridge-extension/fldmhceldgbpfpkbgopacenieobmligc.crx
5f3ef9296fab74b02ab5bf9cba3d4cf8406763a1cbf341765a61c6bc2a34061c
```

The matching WebBridge skill archive used by the desktop first-run installer is
also pinned and copied into the release:

```
resources/resources/skills/kimi-webbridge-desktop.zip
93f84cb202bff3cdee0f9c5d2143995c1f70cb8f09afeed9861d3e3f3d3b703e
```

The Linux optional package versions are pinned in `scripts/build-linux.mjs`.
The same Node 24.15.0 ELF is also installed at `resources/resources/runtime/node`,
the path used by the desktop Gateway supervisor.
The unpacked Browser Extension tree is at
`resources/resources/webbridge-extension/unpacked` for Chromium's “Load
unpacked” flow when a Linux browser policy does not permit a user-level CRX
installation. Its manifest carries the signed CRX public key so the unpacked
development load retains the production extension id and loopback origin.
Run `./configure-linux-host.sh` once as root to set the Electron sandbox,
install the CRX policy for Chromium/Chrome/Edge found on the host, and add the
desktop user to the `input` group for evdev shortcut recording. The helper is
idempotent and prints the exact host state it configured. Pass
`--install-dependencies` to use the detected `pacman`, `apt`, `dnf`, `zypper`,
or `apk` recipe for Chromium, Tesseract, XDG portals, and X11 tooling.
The generated `resources/linux-port-manifest.json` records source archive
hashes, runtime versions, and the adapter list.
If an older Kimi Work process is already running, fully quit it before the
first launch of a rebuilt release; the desktop keeps its WebBridge child
detached and only evaluates the bundled installer resources during startup.
See `DISTRO-SUPPORT.md` for the distro-family package matrix and the explicit
glibc/musl/architecture ABI boundary.

## Run

The generated directory is self-contained when `chrome-sandbox` retains root
ownership and mode `4755`:

```sh
sudo chown root:root dist/kimi-work-linux-x64/chrome-sandbox
sudo chmod 4755 dist/kimi-work-linux-x64/chrome-sandbox
dist/kimi-work-linux-x64/kimi-work
```

For an explicitly sandboxless diagnostic run only, set
`KIMI_ALLOW_NO_SANDBOX=1`. The daemon stores state below `~/.kimi` (or the
configured `KIMI_SHARE_DIR`) and uses Unix/POSIX process groups and sockets.

Run `./check-linux-host.mjs --strict` before launching on a new distribution.
It reports the distro, libc family, desktop session, browser policy paths,
portal backends, OCR languages, evdev keyboard access, user namespaces, and
sandbox ownership. A musl host is rejected explicitly unless a musl-built
Electron target is supplied; the bundled Electron binary is glibc-linked.

Runtime host requirements are a glibc-based x86-64 Linux desktop with GTK 3,
X11/Wayland/GBM libraries, and a working user D-Bus session. Wayland screen
capture requires the compositor's `xdg-desktop-portal` backend; X11 scrolling
additionally needs the `libX11`/`libXtst` runtime libraries used by the bundled
helper. `tesseract` is optional for OCR. These host facilities are deliberately
not replaced with Wine or hidden privileged hooks.

## Verification gates

`npm test` covers adapter contracts, malformed PNG handling, bounded clipboard
path parsing, deterministic hotkey behavior, and the Unix-domain IPC contract.
`npm run verify` additionally checks:

* no `.exe`, `.dll`, `.pdb`, `.cmd`, `.ps1`, or Windows platform directories in
  the generated tree;
* Node v24.15.0, bundled Python 3.12.14, ELF `better-sqlite3`, Linux
  `node-pty`, gateway optional native packages, and the pinned kimi-slides and
  kimiim ELF payloads load and execute at both the `kimiim` and historical
  `kimiim-cli` resource names, with all three kimiim skills present;
* `resources/app.asar` extracts and the patched main bundle parses;
* the desktop-managed `builtin-skills` channel contains the WebMCP and 3D
  annotation skills with manifest-matched hashes;
* the desktop build configuration and WebBridge bundle-version marker are
  present and hash/version matched;
* the Linux WebBridge launcher/daemon and pinned CRX hash, loopback HTTP status,
  policy and command routes, masked WebSocket hello/command/result exchange,
  connection state, bounded shutdown and log receipt; the pinned WebBridge
  skill archive is also checked and available to the first-run installer;
* Electron starts in packed mode with an isolated user-data directory and
  reaches `Ready, loadURL mode` without Linux adapter or Daimon preflight
  failures.

After host configuration, `node test/chromium-webbridge-smoke.cjs` starts an
isolated Chromium profile, loads the signed CRX through the system external-
extension policy, verifies the expected extension id/version attaches to the
loopback daemon, and relays a real `list_tabs` command. It never uses the
user's browser profile and leaves no test process running.
Set `KIMI_CHROMIUM_UNPACKED=1` to exercise the same smoke with the packaged
unpacked tree; it verifies that the injected CRX identity key preserves the
same extension id.
Set `KIMI_VERIFY_REQUIRE_SANDBOX=1` when the verifier is used as the production
release gate; the default verifier also supports an unprivileged staging tree
before the host configurator has been applied.

The live Kimi service still requires the user's account and network. Screenshot
and global-hotkey behavior depends on the desktop session: Wayland compositors
use Electron's portal-backed capture path, while X11/XWayland additionally gets
the bundled `kimi-x11-input` helper (built with `libX11`/`libXtst`). OCR uses a
system `tesseract` installation when present and reports unavailable otherwise.
Electron's POSIX global-shortcut API is press-oriented for ordinary activation;
shortcut recording now uses a bounded evdev reader after the user grants
`input`-device access. The Linux recorder emits only the upstream
`candidate`/`recorded` events and carries the normalized value in both `hotkey`
and `shortcut` fields. Forwarding the internal raw down/up events would make
the bundled main-process recorder interpret the first key-down as an explicit
cancellation, so those events stay private to the parser; the persistent
activation binding maps candidate/recorded back to its down/up lifecycle. This
is important for persistence: the bundled settings IPC reads `shortcut`, while
validation and activation read `hotkey`; omitting either field causes a valid
custom chord to normalize back to `AltRight`. Chords retain their captured
modifiers even when the user releases a modifier before the non-modifier key,
and Linux accepts arbitrary non-Delete tokens (plain, function, modifier, and
multi-modifier chords).
The settings view's transient Linux blur is not treated as cancellation, and
the one-shot recorder is stopped before settlement; its evdev readers are
nonblocking and close on every cancel/success, so repeated assignments cannot
accumulate stale readers or starve the persistent launcher binding.
Long-press release fidelity for the activation shortcut still depends on the
compositor's global-shortcut portal, not an unrestricted keyboard hook.

Linux also provides an extensible custom-hotkey registry in
`~/.config/kimi-desktop/custom-hotkeys.json`. The **Settings -> Shortcuts**
surface lists the registered Kimi actions and provides Assign/Change/Clear
controls, plus a form for user-owned shell commands. Clear removes the
binding from the user config (it is not a hidden disabled assignment), and
the panel is mounted in the existing Shortcuts content column only; it is
removed when the settings router leaves that pane. The current built-in
Linux Shortcuts uses the same native settings-page/section/card/row layer and
style as the stock client. The stock single-launcher row is hidden so there is
one authoritative launcher assignment in this registry; the runtime unregisters
the vendor default and registers it only for an explicit `open-launcher`
binding.
action ids are `open-launcher`, `new-task`, `open-dashboard`, `open-plugins`,
`open-scheduled`, `open-remote-control`, `open-settings`, `open-shortcuts`,
`open-desktop-claw`, `open-terminal`, `toggle-window`, `hide-window`, and
`quit-app`. A future client action is added by registering its metadata in
`native/kimi-hotkeys.cjs` and one explicit main/preload dispatch case; the
storage, recording, conflict, and lifecycle code is shared rather than copied
for each feature. Every enabled shortcut is globally matched by the shared
evdev reader, so one keyboard device is opened regardless of how many actions
or commands are configured.

Commands are launched as the desktop user through `/bin/sh -lc`, with a
validated absolute working directory, 8,192-character command limit, 64
binding/64 command limit, atomic mode-0600 persistence, conflict rejection,
and a four-process concurrency cap. Hand-edited conflicts are disabled
fail-closed and surfaced by the list response. The terminal action uses the
first available host emulator (`kitty` on the current host) and waits for the
child `spawn`/`error` result, returning a visible failure instead of silently
reporting success when no emulator exists. This fixes the Kimi Claw **Open
Terminal** no-op on Linux without executing renderer-supplied command text.
The upstream Kimi Browser Extension/WebBridge documentation currently lists
macOS and Windows as its vendor-supported operating systems. This port keeps
  the extension protocol and supplies a native Linux loopback daemon; browser
  policy may still require the user or administrator to load the packaged CRX in
  Chrome/Edge. The live account, browser extension installation policy, and
  desktop portal permissions remain external gates and are not fabricated by
  this port. Vivaldi is also covered by the Chromium-family policy path; the
  current host retains Vivaldi 8.2 and its WebBridge connection has been
  verified against the loopback daemon.

The supplied desktop build also calls an upstream `WatermarkService` endpoint
that currently returns HTTP 404/unimplemented on both Kimi hosts. The Linux
bundle now classifies that response as an unsupported upstream capability,
keeps all watermark flags fail-closed for the session, and suppresses the
minute-by-minute retry/error loop. A later upstream endpoint can be re-enabled
by a release update; no local watermark behavior is enabled as a workaround.

The POSIX WebBridge daemon is also bounded against the reconnect/degradation
loop: it accepts loopback clients only, requires an extension `hello` within
5 seconds, sends a heartbeat every 15 seconds, closes an extension that has
been idle for 60 seconds, caps HTTP/WebSocket payloads at 1 MiB and in-flight
commands at 32, rotates `desktop-daemon.log` before it exceeds 5 MiB, and
exposes the current extension heartbeat age in `/status`. It retains up to
eight simultaneous extension peers and fails over when one closes instead of
closing the previous healthy peer when another browser profile connects. The
`status` command is available directly from `~/.kimi-webbridge/bin/kimi-webbridge`.
These are daemon startup/runtime safeguards; a running process must be fully
quit and reopened to load a rebuilt release.
