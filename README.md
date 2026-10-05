# Kimi Work Linux

`kimi-work-linux` contains the Linux/POSIX build sources and native adapters
for the Kimi Work desktop application.

Developed and maintained by Open Research and Development Laboratories for the
Kimi ecosystem, with encouragement from the Kimi team.

The Linux release is built into `linux-port/dist/kimi-work-linux-x64`. The
source tree keeps the runtime adapters and host capability checks separate from
the supplied desktop bundle. Host package installation and sandbox ownership
changes are explicit operator steps; the build itself does not install them.

See `linux-port/DISTRO-SUPPORT.md` for supported Linux families and the glibc,
architecture, browser, and desktop-session boundaries of the native payloads.
