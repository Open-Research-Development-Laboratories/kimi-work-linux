# Kimi Work Linux feature-parity matrix

This matrix covers the supplied Windows 3.2.7 bundle, the supplied macOS 3.2.8 source/DMG evidence, and the generated Linux x86-64 release. It records a Linux implementation or an explicit external/ABI boundary for every inventoried desktop surface; it does not claim access to vendor source that was supplied only as a binary artifact.

| Surface | Windows/macOS evidence | Linux-native treatment | Evidence and state |
| --- | --- | --- | --- |
| Electron shell and renderer | Windows `app-64/Kimi.exe`; macOS renderer source/assets | Electron 43.6.0 Linux runtime with patched `resources/app.asar`, unpacked native boundary, and packaged-resource resolution | `npm run verify`: PASS; Electron reaches `Ready, loadURL mode`. PASS |
| Keyboard environment | Windows native addon; macOS desktop integration | `native/kimi-keyboard-environment.cjs` with bounded Linux capability probes and administrator override | Adapter tests and verifier pass. PASS |
| Global shortcuts and recording | Windows `kimi-global-input.node`; macOS global-input surface | POSIX Electron names, evdev reader, deterministic chord parser, shared reader, bounded cancellation/cleanup | `npm test`: 26/26; host input receipt is ready. PASS on configured Linux desktop |
| Screen capture | Windows native capture addon; macOS capture entitlement path | Electron portal-backed capture with bounded POSIX fallback paths | Host check reports portal capture ready; verifier and capture smoke pass. PASS on configured desktop |
| OCR | Windows native OCR addon; macOS OCR integration | Bounded `tesseract` adapter with locale mapping | Host check finds required languages; adapter tests pass. PASS when Tesseract is installed |
| Scroll and pointer input | Windows native scroll addon; macOS input path | X11/XTest helper with explicit unavailable result when no display is present | Helper compile/probes and no-display behavior pass. Conditional on X11/XTest |
| File-manager selection and clipboard paths | Windows file-manager addon; macOS file selection path | POSIX foreground-file-manager probe and bounded path/file-URI parser | Adapter tests pass. PASS |
| Focus/tool-window shim | Windows `kimi-win32.node`; macOS window APIs | Explicit Linux `kimi-win32.cjs` focus/tool-window ABI shim; no Wine/PE fallback | Linux native loader and verifier pass. PASS |
| Named pipe / local IPC | Windows named-pipe addon; macOS IPC | Unix-domain socket newline-delimited JSON adapter with ownership-safe cleanup | Adapter tests pass. PASS |
| Daimon runtime | Windows bundle marked `win32-x64`, with Windows Python/uv/Git and PE SQLite addon | Linux bundle with CPython 3.12.14, host Git/uv, rebuilt ELF SQLite and Linux `node-pty`; packaged under `resources/resources/daimon-bundle` | Resource hashes and runtime checks pass. PASS on supported glibc x86-64 |
| Gateway | Windows gateway ASAR and optional native packages | Linux optional packages outside ASAR, bundled Node 24.15.0 runtime, no PE/DLL payloads | Gateway health and packed-resource checks pass. PASS |
| Browser WebBridge | Windows `kimi-webbridge.exe`; macOS vendor browser integration | First-party POSIX loopback daemon, pinned CRX/unpacked extension, bounded peer/heartbeat/payload lifecycle | `KIMI_VERIFY_REAL_BROWSER=1 KIMI_CHROMIUM_BIN=/usr/bin/vivaldi node scripts/verify-linux.mjs`: PASS; extension id/version and `list_tabs` relay verified |
| Browser policy installation | Vendor-supported Chrome-family integration | `configure-linux-host.sh` installs detected-browser policy; unpacked development load preserves the production extension id | Vivaldi policy is configured on this host. Chromium default smoke timed out because its policy directory is absent; explicit `KIMI_CHROMIUM_UNPACKED=1` or host configuration is required. External host configuration boundary |
| Computer Use | macOS `KimiCU.app` command; Windows helper surface | Native POSIX `kimi-cu`/`kimi-cu.cjs`, configured as `kimi-cu mcp -s user`; no `/Applications/...` path | Verifier and adapter checks pass. PASS |
| Kimi Slides | Windows Rust `kimi-slides.exe`; macOS distribution payload | Pinned official Linux x86-64 ELF 2.2.15 with archive/binary hash verification | Verifier checks help/load/hash. PASS on glibc x86-64 |
| Group-chat CLI and skills | Windows `kimiim-cli.exe`; bundled skills | Pinned Linux ELF exposed as both `kimiim` and historical `kimiim-cli`, with three skills | Verifier checks both names and skills. PASS on glibc x86-64 |
| Built-in skill channel | Present in macOS distribution; absent from an earlier Linux package | `kimi-webmcp` and `kimi-model-annotations` copied into the Linux release and manifest-hashed | Verifier checks content and hashes. PASS |
| Remote Control / phone pairing | Renderer and feature assets in macOS/Windows distributions | Platform-neutral renderer retained; Linux packaging/resource resolution preserved | macOS feature inventory matches Linux source surface; packaged verifier passes. PASS at renderer/resource boundary |
| Scheduled tasks and plugins | Renderer/feature assets in supplied desktop distributions | Platform-neutral renderer and IPC retained in patched packaged app | macOS feature inventory matches Linux source surface; syntax/resource verifier passes. PASS at packaged boundary |
| Launcher capture and work settings | Desktop launcher/work-settings surfaces in supplied distributions | Linux preload/native bridges, custom hotkey registry, POSIX action dispatch, and Linux settings component | Verifier checks packaged bundles and IPC contracts; adapter tests pass. PASS |
| Kimi Claw terminal action | Desktop terminal action in supplied client | Native terminal emulator probe with spawn/error acknowledgement; no renderer-supplied shell text execution | Adapter tests and verifier pass. PASS |
| Authentication, live account, and network service | Vendor account/session and network-dependent behavior | Transport/auth paths remain in the client; account, credentials, and service availability are runtime inputs | Not fabricated by the port. External gate; not a code-parity failure |
| Watermark service | Upstream client calls `WatermarkService` | HTTP 404/unimplemented is classified fail-closed and retry loop is suppressed | Probe recorded in `REVERSE-REVIEW.md`. Explicitly unsupported upstream capability |
| Electron sandbox installation | Vendor packaged runtime expects sandbox permissions | `chrome-sandbox` is shipped; host configurator sets root ownership and mode `04755` | Current host file is user-owned mode `0755`; `verify:production` and `host:check --strict` correctly block until host configuration. External host gate |
| ABI and distribution scope | Windows x86-64 and macOS arm64 supplied artifacts | Linux release is glibc x86-64; musl/non-x86-64 requires a separately built runtime/payload set | `DISTRO-SUPPORT.md` and strict host checker reject unsupported ABI instead of using Wine. Explicit boundary |

## Verification receipt

From `/devops/projects/external/kimi-work` on the current Linux host:

- `npm test --prefix linux-port`: **26/26 passed**.
- `npm run verify --prefix linux-port`: **PASS** (`electronReady: true`).
- `KIMI_VERIFY_REAL_BROWSER=1 KIMI_CHROMIUM_BIN=/usr/bin/vivaldi node linux-port/scripts/verify-linux.mjs`: **PASS**, including the real Chromium-family extension/WebBridge `list_tabs` relay.
- `npm run verify:production --prefix linux-port`: **BLOCKED** only by the host-owned `chrome-sandbox` requirement (`root:root`, mode `04755`); no root action was performed automatically.
- `ELECTRON_ROOT=/devops/projects/external/kimi-work-gui/node_modules/electron/dist npm run build --prefix linux-port -- --force`: **PASS**; the release manifest records Electron `43.6.0`, Node `24.15.0`, and Python `3.12.14`. The system Electron `43.7.3` remains untouched.

The user-supplied path `/devops/porojects/ordl-tsuki` does not exist. The matching Kimi Work project used for this matrix is `/devops/projects/external/kimi-work`; `/devops/projects/external/ordl-tsuki` is a separate Tsuki C23 runtime and does not contain the Windows/macOS Kimi client artifacts.
