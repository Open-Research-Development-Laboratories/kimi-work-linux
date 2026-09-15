# Kimi Work 3.2.7 reverse-review and Linux port record

## Scope

The supplied `app-64` tree is preserved byte-for-byte. The Linux release is
assembled from fresh ASAR/tar extraction on every build; the generated release
is `linux-port/dist/kimi-work-linux-x64`.

Source evidence used by the port:

| Input | Observed evidence |
| --- | --- |
| `app-64/Kimi.exe` | PE32+ x86-64; Electron 43.6.0; embedded Node 24.20.0; app version 3.2.7 |
| `app-64/resources/app.asar` | obfuscated main bundle; native loader resolves `out/native/<platform>-<arch>/<name>.node` |
| `app-64/resources/resources/gateway.asar` | OpenClaw gateway archive; optional native packages were Windows-oriented |
| `app-64/resources/resources/daimon-bundle.tar.gz` | bundle metadata marked `win32-x64`; contained Windows runtimes and PE addons |
| `app-64/resources/resources/kimiim-cli.exe` | static Go group-chat CLI; Linux replacement is pinned separately below |

## Native boundary mapping

| Original native surface | Linux implementation | Contract preserved |
| --- | --- | --- |
| `kimi-keyboard-environment.node` | `native/kimi-keyboard-environment.cjs` | deterministic `evaluate()` result with administrator override |
| `kimi-global-input.node` | `native/kimi-global-input.cjs` | `HotkeyBinding`, evdev-backed `Recording`, candidate/recorded-to-down/release mapping, bounded device discovery |
| `kimi-screen-capture.node` | `native/kimi-screen-capture.cjs` + `linux-common.cjs` | `available()` and bounded `captureRect()` using Electron portal or POSIX screenshot tools |
| `kimi-ocr.node` | `native/kimi-ocr.cjs` | bounded `tesseract` stdin recognition and language mapping |
| `kimi-scroll-input.node` | `native/kimi-scroll-input.cjs` + `native/kimi-x11-input.c` | `isScrollInputAvailable`, `movePointer`, `postScrollWheel`, `restoreScrollOverlay`; X11/XTest only |
| `kimi-file-manager-selection.node` | `native/kimi-file-manager-selection.cjs` + `linux-common.cjs` | foreground-file-manager probe and bounded clipboard POSIX path parsing |
| `kimi-win32.node` | `native/kimi-win32.cjs` | explicit Linux focus/tool-window ABI shim; no PE fallback |
| `kimi-named-pipe.node` | `native/kimi-named-pipe.cjs` | Unix-domain socket newline JSON, request routing, ownership-safe cleanup |
| launcher/custom shortcut surface | `native/kimi-global-input.cjs` + `native/kimi-hotkeys.cjs` | shared evdev reader, candidate/recorded recorder contract, persistent built-in action registry, conflict-safe custom commands |
| Kimi Claw terminal action | `native/kimi-linux-workbench.cjs` | ordered terminal-emulator probe with spawn/error acknowledgement and explicit failure result |
| `kimi-webbridge.exe` | `native/kimi-webbridge-daemon.cjs` + `native/kimi-webbridge` | native Linux loopback HTTP/WebSocket daemon with the vendor CRX protocol; no PE/Wine fallback |

The Linux-only `kimi-cu`/`kimi-cu.cjs` pair is a native POSIX MCP bridge for
Computer Use. It exposes `mcp -s user` and deliberately replaces the supplied
macOS `.app` command in the Linux renderer's copyable configuration.

The patched native loader tries the normal `.node` name first and then the
audited Linux `.cjs` adapter. All adapters and the X11 helper are unpacked
outside `app.asar` so Node never attempts to load executable code from ASAR.
The release also ships `configure-linux-host.sh` and `check-linux-host.mjs`:
the former applies the distro-specific package/policy and sandbox steps, while
the latter emits a bounded libc, desktop, browser, portal, OCR, evdev, and
kernel capability receipt before launch.
`DISTRO-SUPPORT.md` records the package-manager matrix and the glibc/musl and
architecture limits of the pinned vendor ELF payloads.

## Resource resolver fixes

The vendor provider has two different roots. In packaged mode it resolves
`process.resourcesPath/resources`, while the development resolver uses
`app.getAppPath()/resources/targets/<platform>-<arch>`. The release therefore:

* packs the patched application as `resources/app.asar` and sets
  `ELECTRON_FORCE_IS_PACKAGED=1` in the launcher;
* places Daimon at `resources/resources/daimon-bundle`;
* places the gateway at `resources/resources/gateway.asar` plus
  `gateway.asar.unpacked/node_modules`;
* provides the gateway Node launcher at `resources/resources/runtime/node`;
* provides the Linux `kimi-slides` ELF at both the packaged resource path and
  the unpacked target path;
* provides the Linux `kimiim` ELF at both `resources/resources/kimiim` and the
  historical `resources/resources/kimiim-cli` installer name, plus its source
  skills at `resources/resources/skills/kimiim`;
* provides the POSIX WebBridge launcher/daemon and the pinned CRX plus
  unpacked extension tree at `resources/resources/webbridge-extension`, and
  the pinned `kimi-webbridge-desktop.zip` skill archive used by the first-run
  installer.
* provides the desktop-managed `resources/resources/builtin-skills` channel
  (`kimi-webmcp` and `kimi-model-annotations`) that is present in the macOS
  distribution but was previously omitted from the Linux package; each file is
  recorded and verified by manifest SHA-256.
* provides the platform-neutral `resources/resources/build-config.json` and
  the Linux daemon's matching `kimi-webbridge.bundle-version` marker, both
  checked by the release verifier.

The `bin/daimon --node <node> runtime` invocation emitted by the desktop host
is translated to the POSIX `start --control` command. Runtime and control
startup were exercised with a temporary configuration and a dummy provider
key; no account credential is stored in this tree.

## Pinned external Linux payloads

* Kimi Slides 2.2.15 release `926985a4`: archive SHA-256
  `cae4e8d60f50acf3e01c45608ccc4d04ecda079298474816d8b7d9da008d6562`; ELF
  SHA-256 `7d741505224e2790579cfddf32beff843a784482b0003a59b8771dbb000085fe`.
* Kimiim Linux ELF revision `4ee856c34d15`: binary SHA-256
  `4bfd177762cab9f6e3fae38f0ee59cd4d97da98a584f68406fed7a4d28b0df26` (the
  same bytes are published at the `kimiim-cli` compatibility basename).
* Kimi Browser Extension CRX `1.11.6` (id
  `fldmhceldgbpfpkbgopacenieobmligc`): binary SHA-256
  `5f3ef9296fab74b02ab5bf9cba3d4cf8406763a1cbf341765a61c6bc2a34061c`.
* Kimi WebBridge skill archive (gzip tar payload): SHA-256
  `93f84cb202bff3cdee0f9c5d2143995c1f70cb8f09afeed9861d3e3f3d3b703e`.
* WatermarkService endpoint probe: unauthenticated POSTs to both
  `https://www.kimi.com/apiv2/kimi.gateway.watermark.v1.WatermarkService/GetWatermarkConfig`
  and the corresponding `www.kimi.ai` host returned HTTP 404. The Linux main
  bundle therefore treats `404`/`unimplemented` as a permanent session
  fail-closed condition instead of retrying every 30 seconds.
* Supplied `app-64.7z`: SHA-256
  `62f27f3865d405196f73338663800380daca0028eca0082875f23a7f071c0e00`.
* Node `v24.15.0`: archive SHA-256
  `472655581fb851559730c48763e0c9d3bc25975c59d518003fc0849d3e4ba0f6`.
* CPython `3.12.14`: fetched by `uv` and recorded by the release manifest.

Every fetched payload is hash-checked before it enters the staged tree. The
generated `resources/linux-port-manifest.json` records the complete source and
runtime receipt for the release.

## Verification evidence

From `/devops/projects/external/kimi-work`:

* `npm test --prefix linux-port`: **22/22 passed**. The regression suite covers
  evdev chord release ordering, the renderer `candidate`/`recorded` contract
  (including the required `shortcut` field and exclusion of raw lifecycle
  events that the upstream recorder interprets as cancellation), deterministic
  recording, native Computer Use state, nonblocking recorder shutdown, and the
  bounded WebBridge peer lifecycle.
* `npm run verify --prefix linux-port`: **PASS**. This check covers ASAR
  extraction and main-bundle syntax, absence of Windows extensions/directories
  and PE MZ headers, native addon loading, Kimiim/Kimi Slides help and hash
  checks, gateway optional native modules, an actual OpenClaw gateway health
  endpoint through Electron's ASAR/`ELECTRON_RUN_AS_NODE` path, Daimon control
  startup, a packed Electron `Ready, loadURL mode` smoke, and the strict
  sandbox/real-browser integration gates when requested.
* Final generated-tree scan: 32,085 regular files (plus 1,048 symlinks); 41 ELF payloads; zero PE MZ
  headers; zero `.exe/.dll/.pdb/.lib/.exp/.cmd/.ps1/.bat` files and zero
  `windows*`/`win32*` path components.
* Release permissions were normalized for a system-wide install: data files
  are 0644, launchers/runtime binaries are 0755, and the sandbox setup remains
  an explicit root-owned 04755 installation step.
* Forced-build rollback smoke failed before Electron staging and restored a
  marker in the prior output directory, confirming the replacement path does
  not leave a known-good release deleted after a failed build.
* X11 helper compile: `cc -std=c11 -O2 -Wall -Wextra -Werror` with
  `libX11`/`libXtst`; loopback `move` and `scroll` probes returned zero, and
  no-`DISPLAY` returned the expected unavailable status.
* A separate AddressSanitizer/UndefinedBehaviorSanitizer helper build passed;
  empty and malformed argument probes returned the bounded 64 status and a
  no-`DISPLAY` probe returned 69 without sanitizer findings.
* Gateway process smoke returned `{"ok":true,"status":"live"}` and shut down
  cleanly on SIGTERM.
* Electron main-process capture smoke returned a 1920x1080 BGRA bitmap and a
  320x240 bounded crop through the portal-backed `desktopCapturer` path.
* Linux hardware-context collection reads DMI/device-tree files directly; the
  original PowerShell CIM probe is not used on the Linux execution path.
* Electron global-shortcut smoke registered and unregistered `Alt+Right` on
  the active XWayland session; the recorder's evdev parser was exercised with
  synthetic `Ctrl+K` and `Ctrl+Shift+K` lifecycles, including modifier-first
  release. A real packaged-app e2e trace received and persisted
  `Ctrl+Shift+K`; the user profile was restored to its original `AltRight`
  value after the test. The Linux settings recorder now skips only the
  transient blur cancellation path, stops its one-shot reader on settlement,
  and accepts plain side-specific modifiers before the upstream parser can
  reject them.
* The custom-hotkey registry test persisted an action and a shell command,
  rejected a duplicate shortcut atomically, preserved a command shortcut
  during an unrelated edit, and exercised manual command dispatch. A shared
  reader fan-out test confirms that multiple persistent bindings use one
  evdev descriptor. The terminal adapter test confirms missing emulators are
  skipped and a started emulator is reported only after its `spawn` event.
  The packaged Work settings page contains the same registry API and a
  MutationObserver-backed panel. The online settings preload mounts the
  equivalent panel in the existing Shortcuts content column (not a fixed
  opaque overlay), scopes it to that pane, and removes it when the settings
  router navigates elsewhere. Clear operations remove the persisted binding
  rather than retaining a stale disabled entry. The local panel uses the
  shipped native `settings-page`, `settings-section`, `settings-section__card`,
  and `settings-row` layer/classes; the original launcher row is hidden and
  the vendor accelerator is unregistered until the custom registry explicitly
  assigns `open-launcher`.
* Linux WebBridge smoke started the packaged launcher with the embedded Node
  runtime, served `/status` and `/policy`, completed a masked extension hello,
  relayed a `/command` tool call/result, exercised two simultaneous peers and
  failover after one peer closed, and shut down with a bounded log/PID cleanup
  receipt. The native adapter regression suite additionally verifies the 5 MiB
  log-rotation boundary and the `/status` heartbeat-age field; the daemon
  source enforces loopback-only upgrades, a 5-second hello deadline, 60-second
  idle expiry, eight-peer capacity, and bounded HTTP keep-alive/request
  settings.
* Real Chromium-family smoke loaded the signed CRX through the system
  external-extension policy; the current host-specific run used Vivaldi,
  observed extension id `fldmhceldgbpfpkbgopacenieobmligc` version `1.11.6`,
  and relayed `list_tabs` through the running daemon without using a user
  profile.
* The packaged unpacked tree carries the CRX public key; a second Chromium
  smoke with `--load-extension` retained the same extension id and origin.
* The supplied macOS 3.2.8 arm64 DMG was inventoried read-only (DMG SHA-256
  `1a549603407b08a9d22968992aeae40f8531a496ba2582bac17f360ad8391bf9`). Its
  renderer-page and feature asset set matches the Linux source surface,
  including Remote Control/phone pairing, scheduled tasks, plugins, launcher
  capture, and work settings. The only concrete desktop-resource gap found was
  the built-in skill channel; next8 carries it and the strict verifier passes.

## Explicit boundaries

The upstream Browser WebBridge documentation lists macOS and Windows as the
vendor-supported operating systems, but the Linux release supplies a
first-party POSIX daemon and the pinned extension protocol instead of shipping
the Windows helper through Wine or another PE compatibility layer. The shipped
`configure-linux-host.sh` installs the CRX policy for Chromium-family browsers,
sets the Electron sandbox, and has package-manager recipes for Arch/Debian,
Fedora/RHEL, openSUSE, and Alpine. `check-linux-host.mjs --strict` rejects a
musl host when only the bundled glibc Electron target is present instead of
pretending that one binary covers every ABI. The account, desktop portal
permission, and network/auth flows remain external gates. Shortcut recording
uses only detected keyboard evdev nodes and requires the desktop user to be in
the `input` group; activation long-press fidelity still depends on the
compositor's global-shortcut portal.

## Review hygiene receipt

All acceptance verification uses isolated temporary Electron user-data and
daemon state directories. One exploratory direct Electron probe was started
without the isolated launcher and was terminated after discovery; it may have
refreshed the existing profile's ordinary logs/cache/session metadata, but no
profile files were deleted, exported, or restored by the review.
