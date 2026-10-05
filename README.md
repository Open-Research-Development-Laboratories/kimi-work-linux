# kimi-work-linux

Kimi Work desktop for Linux x86_64, maintained by [Open Research and Development Laboratories](https://github.com/Open-Research-Development-Laboratories).

The current release brings Kimi Work **3.2.15** to Linux with Electron **43.6.0**, native desktop adapters, and signed packages for Arch, Debian, and RPM distributions.

[Official Kimi Work product](https://www.kimi.com/products/kimi-work) · [Download releases](https://github.com/Open-Research-Development-Laboratories/kimi-work-linux/releases) · [Kimi Code Linux](https://github.com/Open-Research-Development-Laboratories/kimi-code-linux)

## Downloads

Get the latest packages from [GitHub Releases](https://github.com/Open-Research-Development-Laboratories/kimi-work-linux/releases/tag/v3.2.15-linux.1).

| Format | Download |
| --- | --- |
| Arch Linux | [kimi-work-linux-3.2.15-1-x86_64.pkg.tar.zst](https://github.com/Open-Research-Development-Laboratories/kimi-work-linux/releases/download/v3.2.15-linux.1/kimi-work-linux-3.2.15-1-x86_64.pkg.tar.zst) |
| Debian / Ubuntu | [kimi-work-linux_3.2.15_amd64.deb](https://github.com/Open-Research-Development-Laboratories/kimi-work-linux/releases/download/v3.2.15-linux.1/kimi-work-linux_3.2.15_amd64.deb) |
| Fedora / RPM | [kimi-work-linux-3.2.15-1.x86_64.rpm](https://github.com/Open-Research-Development-Laboratories/kimi-work-linux/releases/download/v3.2.15-linux.1/kimi-work-linux-3.2.15-1.x86_64.rpm) |
| Portable runtime archive | [kimi-work-linux-3.2.15-linux-x86_64.tar.zst](https://github.com/Open-Research-Development-Laboratories/kimi-work-linux/releases/download/v3.2.15-linux.1/kimi-work-linux-3.2.15-linux-x86_64.tar.zst) |

Each package includes a detached signature. The release also includes a signed SHA256 manifest and the ORDL release signing public key.

## Installation

Choose the native package for your distribution. Native packages install Kimi Work under `/opt/kimi-work/3.2.15`, register its desktop entry, and provide the `kimi-work` command.

### Arch Linux

```sh
sudo pacman -U ./kimi-work-linux-3.2.15-1-x86_64.pkg.tar.zst
```

### Debian / Ubuntu

```sh
sudo apt install ./kimi-work-linux_3.2.15_amd64.deb
```

### Fedora / RPM

```sh
sudo dnf install ./kimi-work-linux-3.2.15-1.x86_64.rpm
```

Launch **Kimi Work** from your application menu or run:

```sh
kimi-work
```

The packages target **x86_64 Linux with glibc** and a graphical desktop session. Your package manager installs the declared desktop runtime dependencies. X11 and Wayland integrations are provided by the Linux adapter layer.

The portable archive supplies the assembled runtime for manual deployment. Its launcher requires a root-owned sandbox helper with mode `4755`; native packages configure that metadata during installation.

## Verify your download

Download the package, its matching `.asc` signature, and `ORDL-RELEASE-SIGNING-PUBLIC.asc` from the same release. Import the signing key and verify the package:

```sh
gpg --import ORDL-RELEASE-SIGNING-PUBLIC.asc
gpg --verify kimi-work-linux-3.2.15-1-x86_64.pkg.tar.zst.asc kimi-work-linux-3.2.15-1-x86_64.pkg.tar.zst
```

Replace the Arch filename with your chosen package. The ORDL release signing key fingerprint is:

```text
606B BCE1 D7B4 4959 D5C4 34F6 E41C CFC5 CB03 F0CA
```

To check SHA256 integrity, download `KIMI-WORK-3.2.15-LINUX-SHA256SUMS` and compare your package's `sha256sum` output with its entry in the manifest. The manifest's signature can also be verified:

```sh
gpg --verify KIMI-WORK-3.2.15-LINUX-SHA256SUMS.asc KIMI-WORK-3.2.15-LINUX-SHA256SUMS
```

## Updates

Download subsequent releases from this repository and install the new native package with your distribution's package manager. RPM and Arch removal tests confirmed that user data is retained.

## Source and Linux integration

This repository includes the shipped application JavaScript and resources, along with the Linux integration work.

- `-/out/`: bundled application main, preload, and renderer code.
- `-/assets/`: application icons, resources, and component notices.
- `linux-port/native/`: Linux desktop, input, screen capture, OCR, and WebBridge adapters.
- `linux-port/scripts/`: build, host inspection, and verification scripts.
- `linux-port/test/`: native adapter and browser bridge tests.

The 3.2.15 release was assembled from the version-verified Kimi Work desktop payload distributed through Moonshot's official download service and the verified Electron 43.6.0 Linux runtime. The checked-in source snapshot and Linux port metadata retain their earlier version history; the published package version is 3.2.15.

## Verification

Release checks covered all four package hashes and detached signatures, 26 native adapter tests, the WebBridge daemon smoke test, runtime syntax checks, and portable extraction. Arch and RPM packages passed isolated installation, replacement, removal, and user-data retention checks. Debian control and payload inspection passed.

## Maintainers and feedback

Maintained by [Open Research and Development Laboratories](https://github.com/Open-Research-Development-Laboratories). Report bugs and request improvements through [GitHub Issues](https://github.com/Open-Research-Development-Laboratories/kimi-work-linux/issues).

Component license files and third-party notices are included with the application and retained in the source tree.
