# Linux launch CWD fix receipt — 2026-09-14

## Scope

Repair the public `dist/kimi-work-linux-x64/kimi-work` launcher so it behaves
the same when invoked from `linux-port`, a desktop file, or another working
directory. No application state, tokens, or user data were changed.

## Before

The user-profile launch log (`/home/winsock/.config/kimi-desktop/logs/main.log`)
showed:

* `SessionStart ... "packaged":false`;
* `ensureDaimonBundleExtracted ... provider.usesPackagedTarball()=false`;
* `provision_preflight_missing` for the Daimon bundle;
* `spawn failed ... code=ENOTDIR` against
  `resources/app.asar/resources/targets/linux-x64`.

The generic Electron binary was being launched from the caller's directory,
so it treated the packed archive as a development app.

## Change

Both the build template (`scripts/build-linux.mjs`) and the active release
wrapper now execute `cd "$ROOT"` immediately before invoking Electron. The
wrapper also defaults to software rendering (`--disable-gpu`) because this
host's Electron GPU sandbox was aborting with `GPU process isn't usable`;
`KIMI_DISABLE_GPU=0` or an explicit GPU flag opts out.

Before-wrapper SHA-256 (retained copy):

`1d4fb4bfc647fcac32e04e3be6fc98db6a58484d4c0b37d5961607019b725510`

After-wrapper SHA-256 (CWD fix, before GPU default):

`3797a0fa9a7b851adef200eadc22101800148fdae4d4e0f6ea5aac82deeb0f5a`

Current after-wrapper SHA-256 (CWD + GPU-safe default + Wayland auto-selection):

`fdc7a1870405b5c4abab23eada0f9ad0e69208afa882e5b3bf1564c48a35f4f6`

Retained before copy:
`linux-port/evidence/kimi-work-wrapper.before-cwd-fix-20260914`

## Retest

From `/devops/projects/external/kimi-work/linux-port`, with an isolated
temporary HOME/profile and the active Wayland runtime (no explicit
`--disable-gpu` argument):

* wrapper launch status: `124` (expected bounded timeout);
* `SessionStart ... "packaged":true` — PASS;
* `hardwareAccelerationEnabled:false` and no fatal GPU-process exit — PASS;
* `[App] Ready, loadURL mode` — PASS;
* daemon started at `127.0.0.1:10086` — PASS;
* no `provision_preflight_missing` or `spawn ... ENOTDIR` — PASS.

Verification command (host session):

`XDG_RUNTIME_DIR=/run/user/$(id -u) WAYLAND_DISPLAY=wayland-0 npm run verify`

Result: `{"ok":true,"output":".../linux-port/dist/kimi-work-linux-x64","node":"v24.15.0","electronReady":true}`.

Native adapter regression suite: `npm test` — **26 passed, 0 failed**.

## Live user-profile confirmation

After the wrapper update, a real launch from `linux-port` using the normal user
profile produced `packaged:true`, resolved the Daimon bundle from
`resources/resources/daimon-bundle`, reached `DaimonHost status=ready`, started
the `dream-tick` supervisor, and logged `did-finish-load` followed by
`kimiLoaded=true` / `overlay state spinner → none` in
`/home/winsock/.config/kimi-desktop/logs/main.log` (08:20:03–08:20:10 EDT).

The currently running user-profile process is the fixed release wrapper and
has resolved `--ozone-platform=wayland --disable-gpu`; its Kimi page and
Daimon control plane are live on the user session.
