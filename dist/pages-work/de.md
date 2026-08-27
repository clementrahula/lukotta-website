# German (Deutsch) — the four task pages

Reading direction: ltr. 115 strings.

## What these pages are

Four pages, one for each thing a Mac will not do on its own: open a
BitLocker drive, read a Linux drive, write to an NTFS drive, open a virtual
machine's disk file. Somebody arrives from a search having just plugged in a
drive their Mac offered to erase. Each page answers in the same order: what
the thing is, what the Mac does with it, why it does that, what Lukotta does
about it, then the particulars. The English is deliberately plain and
explains what a filesystem is. Do not assume more of the reader than it
does, and do not assume less.

## The words this language already uses

These are the site's own strings in this language, already translated and
already reviewed. The task pages are the same claims at greater length, to
the same reader. Where one of them has settled on a word for drive, unlock,
passphrase, read-only or Finder, use that word. Disagreeing with them is the
single most likely way these pages go wrong.

- `meta.title`  
  en: Open BitLocker and Linux Drives on macOS — Lukotta  
  de: BitLocker- und Linux-Laufwerke unter macOS öffnen — Lukotta
- `meta.description`  
  en: Open BitLocker, NTFS, LUKS and Linux drives on your Mac. Type the password and the drive appears in Finder, readable and writable. Free and open source.  
  de: BitLocker-, NTFS-, LUKS- und Linux-Laufwerke am Mac öffnen. Passwort eingeben, und es erscheint im Finder, lesbar und beschreibbar. Kostenlos und Open Source.
- `meta.ogTitle`  
  en: Lukotta — BitLocker, Linux and VM disks on macOS  
  de: Lukotta — BitLocker-, Linux- und VM-Laufwerke unter macOS
- `meta.ogDescription`  
  en: Plug in a drive or open a disk image, type the password, and it appears in Finder, readable and writable, like any other disk.  
  de: Laufwerk anschließen oder Image öffnen, Passwort eingeben, und es erscheint im Finder, lesbar und beschreibbar, wie jedes andere Laufwerk.
- `meta.imageAlt`  
  en: The Lukotta application icon: a rounded slate square with a letter L cut out of it.  
  de: Das Symbol der App Lukotta: ein abgerundetes schiefergraues Quadrat mit ausgespartem Buchstaben L.
- `ui.skipToContent`  
  en: Skip to content  
  de: Zum Inhalt springen
- `ui.chooseLanguage`  
  en: Choose a language  
  de: Sprache wählen
- `ui.menu`  
  en: Menu  
  de: Menü
- `ui.footerMenu`  
  en: Legal and contact  
  de: Rechtliches und Kontakt
- `dialog.title`  
  en: Lukotta is a Mac application  
  de: Lukotta ist eine Mac-App
- `dialog.mobileBody`  
  en: It needs macOS 15 Sequoia or later on an Apple Silicon Mac, and will not run on a phone or tablet.  
  de: Es braucht macOS 15 Sequoia oder neuer auf einem Mac mit Apple Silicon und läuft nicht auf einem Telefon oder Tablet.
- `dialog.desktopBody`  
  en: It needs macOS 15 Sequoia or later on an Apple Silicon Mac, and will not run on {system}.  
  de: Es braucht macOS 15 Sequoia oder neuer auf einem Mac mit Apple Silicon und läuft nicht auf {system}.
- `dialog.thisSystem`  
  en: this system  
  de: diesem System
- `dialog.sendHint`  
  en: Send this page to your Mac and download it there; AirDrop is in the list that opens. You can still download the file here, but nothing on this device will open it.  
  de: Schicken Sie diese Seite an Ihren Mac und laden Sie die Datei dort herunter; AirDrop steht in der Liste, die sich öffnet. Sie können die Datei auch hier herunterladen, aber nichts auf diesem Gerät kann die Datei öffnen.
- `dialog.copyHint`  
  en: Copy the link and open it on your Mac to download there. You can still download the file here, but nothing on this device will open it.  
  de: Kopieren Sie den Link und öffnen Sie ihn auf Ihrem Mac, um die Datei dort herunterzuladen. Sie können die Datei auch hier herunterladen, aber nichts auf diesem Gerät kann die Datei öffnen.
- `dialog.sendToMac`  
  en: Send to Mac  
  de: An Mac senden
- `dialog.copyLink`  
  en: Copy Link  
  de: Link kopieren
- `dialog.copied`  
  en: Link copied  
  de: Link kopiert
- `dialog.downloadAnyway`  
  en: Download Anyway  
  de: Trotzdem laden
- `dialog.cancel`  
  en: Cancel  
  de: Abbrechen
- `ui.toTop`  
  en: Back to the top  
  de: Zurück nach oben
- `ui.switchToLight`  
  en: Switch to light appearance  
  de: Zur hellen Darstellung wechseln
- `ui.switchToDark`  
  en: Switch to dark appearance  
  de: Zur dunklen Darstellung wechseln
- `nav.download`  
  en: Download  
  de: Download
- `nav.features`  
  en: Features  
  de: Funktionen
- `nav.how`  
  en: How It Works  
  de: Funktionsweise
- `hero.title`  
  en: Open BitLocker, Linux and virtual machine disks on macOS.  
  de: BitLocker-, Linux- und Virtuelle-Maschinen-Laufwerke unter macOS öffnen.
- `hero.subtitle`  
  en: Plug in a drive or open a disk image and type the password, and it appears in Finder. Readable and writable, like any other disk.  
  de: Laufwerk anschließen oder Image öffnen und das Passwort eingeben, und es erscheint im Finder. Lesbar und beschreibbar, wie jedes andere Laufwerk.
- `hero.download`  
  en: Download  
  de: Download
- `hero.source`  
  en: Source on GitHub  
  de: Quellcode auf GitHub
- `hero.copy`  
  en: Copy  
  de: Kopieren
- `hero.copied`  
  en: Copied  
  de: Kopiert
- `hero.meta`  
  en: Version {version} · Apple Silicon · macOS 15 Sequoia or later  
  de: Version {version} · Apple Silicon · macOS 15 Sequoia oder neuer
- `hero.screenshotAlt`  
  en: The Lukotta window on macOS, listing the drives connected to the Mac and what each one holds.  
  de: Das Lukotta-Fenster unter macOS mit den am Mac angeschlossenen Laufwerken und ihrem Inhalt.
- `how.title`  
  en: How It Works  
  de: Funktionsweise
- `how.lead`  
  en: macOS cannot read BitLocker or Linux filesystems. Linux can. Lukotta starts a small Linux virtual machine, unlocks the drive inside it, and hands the drive back to Finder.  
  de: macOS kann BitLocker und Linux-Dateisysteme nicht lesen. Linux schon. Lukotta startet eine kleine virtuelle Linux-Maschine, entsperrt das Laufwerk darin und übergibt es an den Finder.
- `how.1.title`  
  en: Plug in the drive  
  de: Laufwerk anschließen
- `how.1.body`  
  en: Or open a disk image.  
  de: Oder ein Image öffnen.
- `how.2.title`  
  en: Type the password  
  de: Passwort eingeben
- `how.2.body`  
  en: A volume password, a LUKS passphrase, or a 48-digit BitLocker recovery key.  
  de: Ein Volume-Passwort, eine LUKS-Passphrase oder ein 48-stelliger BitLocker-Wiederherstellungsschlüssel.
- `how.3.title`  
  en: Open it in Finder  
  de: Im Finder öffnen
- `how.3.body`  
  en: The volume appears under Locations, and reads, writes and ejects like any other drive.  
  de: Das Volume erscheint unter Orte und lässt sich lesen, beschreiben und auswerfen wie jedes andere Laufwerk.
- `features.title`  
  en: What Lukotta Opens  
  de: Was Lukotta öffnet
- `features.lead`  
  en: Lukotta opens drives and disk images that macOS refuses to read, and gives them to Finder as ordinary volumes.  
  de: Lukotta öffnet Laufwerke und Images, die macOS nicht lesen will, und übergibt sie dem Finder als gewöhnliche Volumes.
- `features.body`  
  en: It takes physical drives and image files alike. A BitLocker volume opens with its password or with a 48-digit recovery key, and BitLocker and NTFS volumes are both read and written, so files can be copied onto a drive as well as off it.  
  de: Es verarbeitet sowohl physische Laufwerke als auch Image-Dateien. Ein BitLocker-Volume öffnet sich mit seinem Passwort oder mit einem 48-stelligen Wiederherstellungsschlüssel, und BitLocker- und NTFS-Volumes werden gelesen und beschrieben, sodass sich Dateien ebenso auf das Laufwerk kopieren lassen wie davon herunter.
- `features.body2`  
  en: Any drive or image can be opened read-only instead, and Lukotta can reopen whatever was open the last time you were logged in.  
  de: Jedes Laufwerk und jedes Image lässt sich auch schreibgeschützt öffnen, und Lukotta kann erneut öffnen, was bei der letzten Anmeldung geöffnet war.
- `formats.title`  
  en: Supported formats  
  de: Unterstützte Formate
- `formats.col.format`  
  en: Format  
  de: Format
- `formats.col.read`  
  en: Read  
  de: Lesen
- `formats.col.write`  
  en: Write  
  de: Schreiben
- `formats.col.notes`  
  en: Notes  
  de: Anmerkungen
- `formats.yes`  
  en: Yes  
  de: Ja
- `formats.no`  
  en: No  
  de: Nein
- `formats.group.encryption`  
  en: Encryption  
  de: Verschlüsselung
- `formats.group.filesystems`  
  en: Filesystems  
  de: Dateisysteme
- `formats.group.images`  
  en: Disk images  
  de: Images
- `formats.bitlocker.note`  
  en: Unlocked with the volume password or a 48-digit recovery key  
  de: Wird mit dem Volume-Passwort oder einem 48-stelligen Wiederherstellungsschlüssel entsperrt
- `formats.luks.note`  
  en: Unlocked with the passphrase  
  de: Wird mit der Passphrase entsperrt
- `formats.lvm.note`  
  en: Several volumes on one drive unlock together  
  de: Mehrere Volumes auf einem Laufwerk werden zusammen entsperrt
- `formats.ntfs.note`  
  en: Including a volume Windows left dirty or hibernated  
  de: Auch ein Volume, das Windows im Ruhezustand oder unsauber hinterlassen hat
- `formats.linuxfs.note`  
  en: The Linux filesystems  
  de: Die Linux-Dateisysteme
- `formats.exfat.note`  
  en: Supported by macOS natively  
  de: Von macOS nativ unterstützt
- `formats.raw.note`  
  en: Supported by macOS natively  
  de: Von macOS nativ unterstützt
- `formats.qcow2.note`  
  en: QEMU and UTM  
  de: QEMU und UTM
- `formats.vmdk.note`  
  en: VMware, flat and sparse  
  de: VMware, flach und sparse
- `formats.vmdkStream.note`  
  en: What an OVA carries. Written in one pass, so it cannot be changed in place  
  de: Der Inhalt eines OVA. Wird in einem Durchgang geschrieben und lässt sich daher nicht an Ort und Stelle ändern
- `formats.vdi.note`  
  en: VirtualBox  
  de: VirtualBox
- `formats.vhd.note`  
  en: Hyper-V, fixed and dynamic  
  de: Hyper-V, fest und dynamisch
- `formats.vhdx.note`  
  en: Hyper-V. Opens read-only  
  de: Hyper-V. Öffnet schreibgeschützt
- `formats.specs`  
  en: Every format in full detail, including how each one is read and written  
  de: Jedes Format im Einzelnen, und wie es jeweils gelesen und geschrieben wird
- `formats.experimental`  
  en: Support for these formats is experimental. Writing to them has not been extensively tested.  
  de: Die Unterstützung dieser Formate ist experimentell. Das Schreiben in sie ist nicht ausgiebig getestet.
- `formats.not.title`  
  en: What Lukotta Does Not Open  
  de: Was Lukotta nicht öffnet
- `formats.not.1`  
  en: FileVault and encrypted disk images, which macOS opens itself  
  de: FileVault und verschlüsselte Images, die macOS selbst öffnet
- `formats.not.2`  
  en: Drives sealed to a TPM rather than a password, including Ubuntu's newer hardware-backed encryption  
  de: Laufwerke, die an ein TPM statt an ein Passwort gebunden sind, einschließlich der neueren hardwaregestützten Verschlüsselung von Ubuntu
- `formats.not.3`  
  en: LUKS volumes whose header is stored away from the drive  
  de: LUKS-Volumes, deren Header getrennt vom Laufwerk liegt
- `formats.not.4`  
  en: VeraCrypt and TrueCrypt  
  de: VeraCrypt und TrueCrypt
- `formats.not.5`  
  en: An image that names another file: a VMware snapshot chain, a differencing VHD, or a qcow2 with a backing file  
  de: Ein Image, das eine andere Datei benennt: eine VMware-Snapshot-Kette, eine differenzierende VHD oder ein qcow2 mit Backing-Datei
- `name.title`  
  en: The Name  
  de: Der Name
- `name.body`  
  en: Lúkotta is Finnish for “without a lock”, from {lukko}, a lock, with the ending {tta} marking the absence of something. The stress falls on the first syllable, as it always does in Finnish.  
  de: Lúkotta ist Finnisch für „ohne Schloss“, von {lukko}, dem Schloss, mit der Endung {tta}, die das Fehlen von etwas anzeigt. Die Betonung liegt auf der ersten Silbe, wie im Finnischen immer.
- `faq.title`  
  en: FAQ  
  de: Häufige Fragen
- `faq.1.q`  
  en: Is Lukotta free?  
  de: Ist Lukotta kostenlos?
- `faq.1.a`  
  en: Yes, Lukotta is free to download and free to use. There is no paid version, no subscription, no trial that runs out and no account to make.  
  de: Ja, Lukotta ist kostenlos zu laden und kostenlos zu benutzen. Es gibt keine bezahlte Version, kein Abonnement, keine Testphase, die abläuft, und kein Konto, das angelegt werden müsste.
- `faq.1.a2`  
  en: It is also free software, under the GNU General Public License, version 3 or later. The source is public: you can read it, build it yourself, change it, and pass on what you change.  
  de: Es ist außerdem freie Software unter der GNU General Public License, Version 3 oder neuer. Der Quellcode ist offen: Sie können ihn lesen, selbst bauen, ändern und Ihre Änderungen weitergeben.
- `faq.2.q`  
  en: How do you open a BitLocker drive on a Mac?  
  de: Wie öffnet man ein BitLocker-Laufwerk auf einem Mac?
- `faq.2.a`  
  en: macOS cannot mount a BitLocker volume by itself. Lukotta opens one read and write: type the volume password, or paste a 48-digit recovery key, and the drive appears in Finder.  
  de: macOS kann ein BitLocker-Volume nicht selbst einbinden. Lukotta öffnet es zum Lesen und Schreiben: Geben Sie das Volume-Passwort ein oder fügen Sie einen 48-stelligen Wiederherstellungsschlüssel ein, und das Laufwerk erscheint im Finder.
- `faq.3.q`  
  en: Can a Mac write to an NTFS drive?  
  de: Kann ein Mac auf ein NTFS-Laufwerk schreiben?
- `faq.3.a`  
  en: Not on its own. macOS mounts NTFS read-only. Lukotta mounts it read and write, so files copy onto an NTFS drive as well as off it.  
  de: Von sich aus nicht. macOS bindet NTFS nur lesend ein. Lukotta bindet es zum Lesen und Schreiben ein, sodass Dateien ebenso auf ein NTFS-Laufwerk kopiert werden wie davon.
- `faq.4.q`  
  en: How do you read an ext4 or btrfs drive on a Mac?  
  de: Wie liest man ein ext4- oder btrfs-Laufwerk auf einem Mac?
- `faq.4.a`  
  en: macOS reads none of the Linux filesystems. Lukotta opens ext2, ext3, ext4, btrfs and XFS, plain or inside LUKS encryption. A drive laid out with LVM opens all its volumes together.  
  de: macOS liest keines der Linux-Dateisysteme. Lukotta öffnet ext2, ext3, ext4, btrfs und XFS, unverschlüsselt oder innerhalb einer LUKS-Verschlüsselung. Ein mit LVM eingerichtetes Laufwerk öffnet alle seine Volumes zusammen.
- `faq.5.q`  
  en: Can you open a virtual machine disk without starting the machine?  
  de: Lässt sich die Festplatte einer virtuellen Maschine öffnen, ohne die Maschine zu starten?
- `faq.5.a`  
  en: Yes. Lukotta opens a qcow2, VMDK, VDI, VHD or VHDX image directly and copies files out of it, or into it. Writing is experimental for VMDK, VDI and VHD; VHDX and stream-optimized VMDK open read-only.  
  de: Ja. Lukotta öffnet ein qcow2-, VMDK-, VDI-, VHD- oder VHDX-Image direkt und kopiert Dateien daraus oder hinein. Das Schreiben ist bei VMDK, VDI und VHD experimentell; VHDX und VMDK stream-optimized werden nur lesend geöffnet.
- `faq.6.q`  
  en: Does Lukotta run on an Intel Mac?  
  de: Läuft Lukotta auf einem Intel-Mac?
- `faq.6.a`  
  en: No. Lukotta needs the virtualisation Apple Silicon provides, so it runs on Apple Silicon Macs only, on macOS 15 Sequoia or later.  
  de: Nein. Lukotta benötigt die Virtualisierung, die Apple Silicon bietet, und läuft daher nur auf Macs mit Apple Silicon, unter macOS 15 Sequoia oder neuer.
- `footer.privacy`  
  en: Privacy Policy  
  de: Datenschutzerklärung
- `footer.licence`  
  en: Licence  
  de: Lizenz
- `footer.source`  
  en: Source  
  de: Quellcode
- `footer.contact`  
  en: Contact  
  de: Kontakt
- `footer.copyright`  
  en: {copyleft} {year} {author}  
  de: {copyleft} {year} {author}
- `footer.gpl`  
  en: Free software under the GNU General Public License, version 3 or later.  
  de: Freie Software unter der GNU General Public License, Version 3 oder neuer.
- `footer.content`  
  en: Page text under the Creative Commons Attribution-ShareAlike 4.0 licence.  
  de: Seitentext unter der Lizenz Creative Commons Attribution-ShareAlike 4.0.

## The addresses

Each page carries its own address, in this language. It is lowercase a-z,
0-9 and single hyphens: no accents and no other script. That is not a
preference. The address becomes a folder on the build machine, a line in the
sitemap and a URL submitted to IndexNow, and macOS stores folder names in a
different Unicode normalisation from the one those files would carry, so a
non-ASCII address quietly stops matching itself.

So write what somebody searching in this language would actually type, with
the accents removed, rather than a transliteration of the English. Where the
language searches for these things in English anyway, which is common for
BitLocker and NTFS, the address may keep the English word.

## The glossary

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


## The strings

### `ui.free`

The line under the download heading at the foot of every task page.

```
It is free to download and use.
```

### `faq.bitlocker`

The link at the end of an answer in the FAQ on the landing page, leading to the bitlocker page. It must not repeat the question it sits under.

```
More about BitLocker drives, and what to do if the password is lost
```

### `faq.ntfs`

The link at the end of an answer in the FAQ on the landing page, leading to the ntfs page. It must not repeat the question it sits under.

```
More about NTFS drives, including ones Windows left dirty
```

### `faq.linux`

The link at the end of an answer in the FAQ on the landing page, leading to the linux page. It must not repeat the question it sits under.

```
More about Linux drives and LUKS encryption
```

### `faq.disk-images`

The link at the end of an answer in the FAQ on the landing page, leading to the disk-images page. It must not repeat the question it sits under.

```
More about disk images, and which can be written to
```

### `bitlocker.title`

The page's heading, its browser tab, and the first line of its search result. Under about 55 characters.

```
Open a BitLocker drive on a Mac
```

### `bitlocker.description`

The second line of the search result. Never on the page. Written for somebody typing their problem into a search engine. Between 70 and 160 characters.

```
macOS will not open a BitLocker drive and offers to erase it instead. Here is why, and how to read the drive and copy files onto it.
```

### `bitlocker.slug`

The address. See the note on addresses in the brief.

```
open-bitlocker-drive-on-mac
```

### `bitlocker.lead`

The opening paragraph, in larger type under the heading.

```
Plug a BitLocker drive into a Mac and Finder offers to erase it. Here is why, and how to read the drive instead.
```

### `bitlocker.s0.heading`

A section heading.

```
What BitLocker is
```

### `bitlocker.s0.p0`

A paragraph.

```
BitLocker is the encryption built into Windows. When it is turned on, everything written to the drive is scrambled, and the contents cannot be read without the password. Windows uses it on its own drive, and on USB drives and memory cards, where it is called BitLocker To Go.
```

### `bitlocker.s0.p1`

A paragraph.

```
It is the same encryption in both cases. If the drive is lost, whoever finds it cannot read anything on it.
```

### `bitlocker.s1.heading`

A section heading.

```
What happens when you plug one into a Mac
```

### `bitlocker.s1.p0`

A paragraph.

```
Finder says the disk is unreadable and offers to initialise or erase it. It does not ask for a password, and nothing on screen suggests the drive is locked rather than broken.
```

### `bitlocker.s1.p1`

A paragraph.

```
The drive is not damaged. macOS has its own encryption, FileVault, and does not understand BitLocker at all. It reads the beginning of the drive, finds a layout it does not recognise, and treats the disk as unformatted, so the only thing it can offer is to erase it.
```

### `bitlocker.s2.heading`

A section heading.

```
How Lukotta opens it
```

### `bitlocker.s2.p0`

A paragraph.

```
Linux has been able to read BitLocker for years, and that is what Lukotta uses. It starts a small Linux system in the background, hands it the drive, and unlocks it there with the password you type. The unlocked drive goes back to Finder, where it appears under Locations alongside your other disks.
```

### `bitlocker.s2.p1`

A paragraph.

```
The drive is not converted or copied. It stays a BitLocker drive, still encrypted, and Windows still reads it.
```

### `bitlocker.s3.heading`

A section heading.

```
Opening the drive
```

### `bitlocker.s3.l0`

One numbered step. It is an instruction; write it as one.

```
Plug in the drive. Lukotta lists it and shows it as locked.
```

### `bitlocker.s3.l1`

One numbered step. It is an instruction; write it as one.

```
Click it and type the password you use on Windows.
```

### `bitlocker.s3.l2`

One numbered step. It is an instruction; write it as one.

```
The drive appears in Finder under Locations.
```

### `bitlocker.s4.heading`

A section heading.

```
If you do not have the password
```

### `bitlocker.s4.p0`

A paragraph.

```
When the drive was encrypted, Windows generated a recovery key and asked where to keep it. It opens the drive in place of the password. It is 48 digits, in eight groups of six:
```

### `bitlocker.s4.p1`

A paragraph.

```
    123456-789012-345678-901234-567890-123456-789012-345678
```

### `bitlocker.s4.p2`

A paragraph.

```
It may be saved in a Microsoft account, in a text file, or printed on paper. Paste it where the password would go.
```

### `bitlocker.s4.p3`

A paragraph.

```
Without the password or the key, the drive cannot be opened by any program, on any computer.
```

### `bitlocker.s5.heading`

A section heading.

```
Drives that will not open on a Mac
```

### `bitlocker.s5.p0`

A paragraph.

```
Some Windows PCs never ask for a password. They keep the key in a chip on the motherboard, called a TPM, and unlock the drive automatically when that machine starts.
```

### `bitlocker.s5.p1`

A paragraph.

```
A drive set up that way only works in the PC it came from, because the key never leaves it. No Mac can open it, and neither can another PC. If a recovery key was saved when the drive was encrypted, that will still open it.
```

### `bitlocker.s6.heading`

A section heading.

```
Copying files onto the drive
```

### `bitlocker.s6.p0`

A paragraph.

```
BitLocker drives open for reading and writing, so a Mac can add files to a Windows backup rather than only take them off.
```

### `bitlocker.s6.p1`

A paragraph.

```
Lukotta can also open the drive read-only, which is worth doing when you are recovering files from a drive that has been playing up. Nothing can be written to it then.
```

### `linux.title`

The page's heading, its browser tab, and the first line of its search result. Under about 55 characters.

```
Read an ext4, btrfs or XFS drive on a Mac
```

### `linux.description`

The second line of the search result. Never on the page. Written for somebody typing their problem into a search engine. Between 70 and 160 characters.

```
macOS cannot read ext4, btrfs or XFS and offers to erase the drive. Here is why, and how to open a Linux drive on a Mac, LUKS included.
```

### `linux.slug`

The address. See the note on addresses in the brief.

```
read-ext4-drive-on-mac
```

### `linux.lead`

The opening paragraph, in larger type under the heading.

```
Plug in a drive from a Linux machine and Finder offers to erase it. Here is why, and how to read it instead.
```

### `linux.s0.heading`

A section heading.

```
Why a Mac cannot read the drive
```

### `linux.s0.p0`

A paragraph.

```
Every drive has a filesystem: the arrangement that records where each file starts, what it is called, and which parts of the disk are still free. Windows uses NTFS. macOS uses APFS. Linux usually uses ext4, and sometimes btrfs or XFS.
```

### `linux.s0.p1`

A paragraph.

```
The files themselves are ordinary. What differs is the index in front of them, and a computer that cannot read the index has no way to find anything, even though everything is still there.
```

### `linux.s1.heading`

A section heading.

```
What happens when you plug one into a Mac
```

### `linux.s1.p0`

A paragraph.

```
Finder says the disk is unreadable and offers to erase it. That is the same message macOS gives for a blank disk or a failing one, so the message gives you no way to tell the drive is fine.
```

### `linux.s1.p1`

A paragraph.

```
macOS includes support for its own filesystems and for a few common ones such as exFAT. The Linux filesystems are not among them, so an ext4 drive looks to macOS like a blank disk.
```

### `linux.s2.heading`

A section heading.

```
How Lukotta reads it
```

### `linux.s2.p0`

A paragraph.

```
Lukotta starts a small Linux system in the background and gives it the drive. Linux reads ext4, btrfs and XFS on its own, so the drive opens there without any conversion, and Lukotta passes it on to Finder.
```

### `linux.s2.p1`

A paragraph.

```
Nothing is written to the drive, and it behaves normally when it goes back into the Linux machine.
```

### `linux.s3.heading`

A section heading.

```
What Lukotta reads
```

### `linux.s3.p0`

A paragraph.

```
ext2, ext3 and ext4, which cover most Linux systems. btrfs, the default on Fedora and openSUSE. XFS, common on servers.
```

### `linux.s3.p1`

A paragraph.

```
Encrypted or not. If the drive was set up with LVM, which divides one physical drive into several volumes, they all open together rather than one at a time.
```

### `linux.s4.heading`

A section heading.

```
Opening the drive
```

### `linux.s4.l0`

One numbered step. It is an instruction; write it as one.

```
Plug in the drive. Lukotta lists what is on it.
```

### `linux.s4.l1`

One numbered step. It is an instruction; write it as one.

```
If it is encrypted, type the passphrase.
```

### `linux.s4.l2`

One numbered step. It is an instruction; write it as one.

```
The drive appears in Finder under Locations.
```

### `linux.s5.heading`

A section heading.

```
If it asks for a passphrase
```

### `linux.s5.p0`

A paragraph.

```
LUKS is how Linux encrypts a whole drive. If the machine this drive came from asks for a passphrase early in startup, before the login screen, that is LUKS, and it is the passphrase to type here.
```

### `linux.s5.p1`

A paragraph.

```
It is separate from the login password, though many people set both to the same thing.
```

### `linux.s6.heading`

A section heading.

```
Drives that will not open
```

### `linux.s6.p0`

A paragraph.

```
A LUKS drive can be set up with its header stored elsewhere, on another disk or a USB stick. The header is the part that describes the encryption. Without it there is nothing on the drive to unlock.
```

### `linux.s6.p1`

A paragraph.

```
Newer Ubuntu installations can also tie the key to a chip inside the machine, in the same way BitLocker does. Those drives only open in the computer they came from.
```

### `ntfs.title`

The page's heading, its browser tab, and the first line of its search result. Under about 55 characters.

```
Write to an NTFS drive on a Mac
```

### `ntfs.description`

The second line of the search result. Never on the page. Written for somebody typing their problem into a search engine. Between 70 and 160 characters.

```
macOS opens NTFS drives read-only, so files copy off them but not onto them. Here is why, and how to write to an NTFS drive on a Mac.
```

### `ntfs.slug`

The address. See the note on addresses in the brief.

```
write-to-ntfs-drive-on-mac
```

### `ntfs.lead`

The opening paragraph, in larger type under the heading.

```
macOS lets you copy files off an NTFS drive but not onto it. Here is why, and what to do about it.
```

### `ntfs.s0.heading`

A section heading.

```
What NTFS is
```

### `ntfs.s0.p0`

A paragraph.

```
NTFS is the filesystem Windows uses, both for its own drive and for external drives formatted on a PC. A USB drive formatted on a Windows machine is usually NTFS.
```

### `ntfs.s0.p1`

A paragraph.

```
The other common one is exFAT, used by most memory cards and many USB sticks because Windows and macOS can both write to it. If your drive is exFAT then macOS already handles it and none of this applies. To check, click the drive in Finder and choose File, then Get Info. The Format line tells you.
```

### `ntfs.s1.heading`

A section heading.

```
What happens when you plug one into a Mac
```

### `ntfs.s1.p0`

A paragraph.

```
The drive appears in Finder and you can see the files. Copying files off it works normally. Copying anything onto it does not: Finder refuses, and the drive behaves as though it were locked.
```

### `ntfs.s1.p1`

A paragraph.

```
macOS opens NTFS drives read-only. It has been able to write NTFS for years, but that is switched off and there is no supported way to turn it on. Writing NTFS is harder than reading it, and a mistake can leave a drive that Windows then refuses to open.
```

### `ntfs.s2.heading`

A section heading.

```
How Lukotta writes to it
```

### `ntfs.s2.p0`

A paragraph.

```
Lukotta opens the drive with the NTFS driver from Linux, which does write, and which Linux machines use every day. The drive is handed to Finder afterwards, so copying files onto it works like copying anything else.
```

### `ntfs.s2.p1`

A paragraph.

```
The drive stays NTFS, and Windows reads it afterwards.
```

### `ntfs.s3.heading`

A section heading.

```
Opening the drive
```

### `ntfs.s3.l0`

One numbered step. It is an instruction; write it as one.

```
Plug in the drive. Lukotta lists it.
```

### `ntfs.s3.l1`

One numbered step. It is an instruction; write it as one.

```
Click it.
```

### `ntfs.s3.l2`

One numbered step. It is an instruction; write it as one.

```
It appears in Finder under Locations, and files copy in both directions.
```

### `ntfs.s4.p0`

A paragraph.

```
An NTFS drive usually has no password, so there is nothing to type unless BitLocker has been turned on as well.
```

### `ntfs.s5.heading`

A section heading.

```
Drives Windows did not shut down properly
```

### `ntfs.s5.p0`

A paragraph.

```
Windows marks a drive as dirty when writing was interrupted, usually because the drive was unplugged or the machine lost power partway through. The mark warns the next computer that opens it that the drive may be half-written and should be checked.
```

### `ntfs.s5.p1`

A paragraph.

```
Fast Startup leaves the same mark even when nothing has gone wrong. It is on by default in Windows 10 and 11. Instead of shutting the machine down it hibernates it, which leaves the drive looking as though it is still in use.
```

### `ntfs.s5.p2`

A paragraph.

```
macOS refuses a drive in either state and gives no reason. Lukotta opens it.
```

### `ntfs.s5.p3`

A paragraph.

```
If you still have the Windows machine, the tidier fix is to plug the drive back in and shut that machine down properly: hold Shift as you click Shut down, which skips Fast Startup.
```

### `disk-images.title`

The page's heading, its browser tab, and the first line of its search result. Under about 55 characters.

```
Open a VMDK, VDI or VHD file on a Mac
```

### `disk-images.description`

The second line of the search result. Never on the page. Written for somebody typing their problem into a search engine. Between 70 and 160 characters.

```
Open a VMDK, VDI, VHD or qcow2 file on a Mac and copy files out of it, without installing VMware or VirtualBox or starting the machine.
```

### `disk-images.slug`

The address. See the note on addresses in the brief.

```
open-vmdk-vdi-vhd-file-on-mac
```

### `disk-images.lead`

The opening paragraph, in larger type under the heading.

```
A virtual machine keeps its whole disk inside a single file. You can open that file on a Mac and take things out of it without ever starting the machine.
```

### `disk-images.s0.heading`

A section heading.

```
What a disk image is
```

### `disk-images.s0.p0`

A paragraph.

```
When you run a virtual machine, the machine's hard disk is a single ordinary file sitting on your Mac. Its operating system, its programs and every document in it are all inside that one file.
```

### `disk-images.s0.p1`

A paragraph.

```
Each program writes that file its own way. VMware uses VMDK, VirtualBox uses VDI, Hyper-V uses VHD and VHDX, and QEMU and UTM use qcow2. A raw image, usually ending in .img, is a straight copy of a disk with nothing wrapped round it.
```

### `disk-images.s1.heading`

A section heading.

```
Why getting a file out is awkward
```

### `disk-images.s1.p0`

A paragraph.

```
The usual route is to start the virtual machine, wait for it to boot, find the file inside it and copy it across. That means the machine still has to work, and the program that runs it still has to be installed.
```

### `disk-images.s1.p1`

A paragraph.

```
Finder is no use here either. Double-clicking a VMDK does nothing, because macOS does not know what is inside it.
```

### `disk-images.s2.heading`

A section heading.

```
How Lukotta opens it
```

### `disk-images.s2.p0`

A paragraph.

```
Lukotta reads the image directly. It works out what format the file is in, finds the disk inside, and opens it in the small Linux system it runs in the background. What is inside then appears in Finder as an ordinary disk.
```

### `disk-images.s2.p1`

A paragraph.

```
The virtual machine stays switched off. VMware and VirtualBox do not need to be installed, and opening the file does not change it.
```

### `disk-images.s3.heading`

A section heading.

```
Which files Lukotta opens
```

### `disk-images.s3.l0`

One item in a list.

```
qcow2, from QEMU and UTM.
```

### `disk-images.s3.l1`

One item in a list.

```
VMDK, from VMware.
```

### `disk-images.s3.l2`

One item in a list.

```
VDI, from VirtualBox.
```

### `disk-images.s3.l3`

One item in a list.

```
VHD and VHDX, from Hyper-V.
```

### `disk-images.s3.l4`

One item in a list.

```
Raw images, usually ending in .img.
```

### `disk-images.s4.heading`

A section heading.

```
Opening one
```

### `disk-images.s4.l0`

One numbered step. It is an instruction; write it as one.

```
Choose File, then Open Disk Image, and pick the file.
```

### `disk-images.s4.l1`

One numbered step. It is an instruction; write it as one.

```
If the disk inside is encrypted, type the password or passphrase.
```

### `disk-images.s4.l2`

One numbered step. It is an instruction; write it as one.

```
The contents appear in Finder under Locations.
```

### `disk-images.s5.heading`

A section heading.

```
One file often holds several drives
```

### `disk-images.s5.p0`

A paragraph.

```
A disk image usually contains more than one partition: a small boot partition, the main one holding everything, and sometimes a recovery partition. Lukotta lists them and you open whichever you need, the same way you would pick a drive.
```

### `disk-images.s6.heading`

A section heading.

```
Copying files into an image
```

### `disk-images.s6.p0`

A paragraph.

```
qcow2 is written the ordinary way and is safe to write to.
```

### `disk-images.s6.p1`

A paragraph.

```
VMDK, VDI and VHD can be written to, but that is recent work and has not been used long enough to trust with anything you cannot afford to lose. Copy the file and work on the copy, or open it read-only and take files out instead.
```

### `disk-images.s6.p2`

A paragraph.

```
VHDX opens read-only, as does the kind of VMDK found inside an OVA file. That sort is written straight through in one pass and cannot be changed in place afterwards.
```

### `disk-images.s7.heading`

A section heading.

```
Files that will not open
```

### `disk-images.s7.p0`

A paragraph.

```
An image only opens if it is complete on its own.
```

### `disk-images.s7.p1`

A paragraph.

```
A VMware snapshot chain spreads the machine's current state across an original file and a series of smaller ones recording what changed after it. A split disk divides one image into many pieces. A Hyper-V differencing disk holds only the differences from another file.
```

### `disk-images.s7.p2`

A paragraph.

```
In each case the file you have is part of a set, and Lukotta opens one file at a time.
```
