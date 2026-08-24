# Words that are not free to translate

The same rules the application's own translations follow. Lukotta's interface
and this website are read by the same person, often on the same afternoon, and
they must not disagree about what anything is called.

Three policies, exactly as in the application's `translations/context/terms.json`:

| Policy | What to do |
| --- | --- |
| **keep verbatim** | Write it exactly as in the English, in Latin script, whatever the surrounding language. Do not transliterate. |
| **Apple's term** | Use the words Apple itself uses in this language on macOS. Where macOS is not offered in this language, keep the English, because the reader's own Mac shows the English. |
| **translate** | An ordinary word. Translate it. |

## Keep verbatim

**Lukotta** — the name of the application, and a trademark.

**macOS**, **Apple Silicon**, **Sequoia**, **Mac** — Apple writes these the same
way in every language.

**Format and product names, in any script**: BitLocker, NTFS, LUKS, LUKS1,
LUKS2, LVM, ext4, btrfs, XFS, exFAT, qcow2, VMDK, VDI, VHD, VHDX, IMG, DMG, OVA,
VMware, VirtualBox, Hyper-V, QEMU, UTM, Ubuntu, Debian, Mint, Fedora, Windows,
Linux, GitHub, `qemu-img`, GPL, GNU General Public License.

## Apple's term

These name something the reader is looking at on their own Mac. If the name on
the screen and the name in the sentence differ, the sentence fails.

- **Finder**
- **System Settings**
- **Full Disk Access**
- **Locations** — the Finder sidebar section an opened drive appears under
- **Keychain**
- **Applications** — the folder
- **Bin** — where a deleted application goes
- **Login Items**
- **Removable Volumes**

Where macOS is not offered in the language, leave these in English. That applies
to Bulgarian, Estonian, Latvian, Lithuanian and Albanian.

## Translate

Everything else, including *drive*, *disk image*, *volume*, *password*,
*passphrase*, *recovery key*, *unlock*, *open*, *eject*, *virtual machine*.

## Two more rules

**Placeholders survive.** `{version}`, `{year}` and `{author}` are replaced when
the page is built. Every one that appears in the English must appear in the
translation, spelled the same way. A missing one leaves a literal `{version}` on
the page.

**British spelling in English is deliberate**: *notarised*, *licence*,
*recognise*, *organised*. This says nothing about your language; it is only so
you know the English is not a typo.
