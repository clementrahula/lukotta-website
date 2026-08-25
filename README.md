# Lukotta.com Website

The website for **Lukotta**, an application that opens BitLocker, Linux and
virtual machine disks on macOS. Plug in a drive or open a disk image, type the
password, and the volume appears in Finder. Readable and writable, like any
other disk.

macOS cannot mount BitLocker volumes, Linux filesystems such as ext4, btrfs and
XFS, LUKS encryption, or most virtual machine disk images. Lukotta can. It
costs nothing and is free software under the GPL, version 3 or later. It needs
macOS 15 Sequoia or later on an Apple Silicon Mac.

## What Lukotta Opens

**Encryption**

| Format | Read | Write |
| --- | --- | --- |
| BitLocker | Yes | Yes |
| LUKS1, LUKS2 | Yes | Yes |
| LVM inside LUKS | Yes | Yes |

**Filesystems**

| Format | Read | Write |
| --- | --- | --- |
| NTFS | Yes | Yes |
| ext2, ext3, ext4, btrfs, XFS | Yes | Yes |
| exFAT, FAT † | Yes | Yes |

**Disk images**

| Format | Read | Write |
| --- | --- | --- |
| IMG, DMG † | Yes | Yes |
| qcow2 | Yes | Yes |
| VMDK \* | Yes | Yes |
| VMDK, stream-optimized \* | Yes | No |
| VDI \* | Yes | Yes |
| VHD \* | Yes | Yes |
| VHDX \* | Yes | No |

† Supported by macOS natively.

\* Support for these formats is experimental. Writing to them has not been
extensively tested.

BitLocker volumes unlock with the volume password or a 48-digit recovery key.

## What Lukotta Does Not Open

- FileVault and encrypted disk images, which macOS opens itself
- Drives sealed to a TPM rather than a password, including Ubuntu's newer
  hardware-backed encryption
- LUKS volumes whose header is stored away from the drive
- VeraCrypt and TrueCrypt
- An image that names another file: a VMware snapshot chain, a differencing
  VHD, or a qcow2 with a backing file

## The Application

Downloads, releases, issues and the source live in the application's own
repository: **[github.com/clementrahula/lukotta](https://github.com/clementrahula/lukotta)**

## This Repository

- **[lukotta.com](https://lukotta.com)** — the site this repository builds, in 37 languages
- **Licence** — the code is [GPL-3.0-or-later](LICENSE.txt); the words are [CC BY-SA 4.0](LICENSE-CONTENT.txt)
- **[Third-Party Notices](THIRD_PARTY_NOTICES.md)** — the two typefaces the site carries
- **[Trademarks](https://github.com/clementrahula/lukotta/blob/main/TRADEMARKS.txt)** — the Lukotta name and logo are not covered by the licence
- **[Security](https://github.com/clementrahula/lukotta/blob/main/SECURITY.md)** — how to report a vulnerability, privately
- **[Privacy Policy](https://github.com/clementrahula/lukotta/blob/main/PRIVACY.md)** — what the application collects, which is nothing
