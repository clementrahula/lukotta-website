## da — the existing landing page disagrees with itself about "recovery key"

`how.2.body` and `formats.bitlocker.note` say **genoprettelsesnøgle**; `faq.2.a`
says **gendannelsesnøgle**. The application says genoprettelsesnøgle. The task
pages follow the majority, but one of the two landing strings should change so
the site says one thing.

## nb — the existing landing page alternates between "stasjon" and "disk"

`how.lead` and `features.body2` say **stasjon**; `faq.2.a` and `faq.3.a` say
**disk** for the same thing. The task pages use stasjon for a drive and keep
disk for a disk, but the landing page should settle on one.

## sv — the site says "avbild" where the application says "skivavbild"

Apple's Swedish term is **skivavbild**, which is what the application uses. The
landing page says **avbild** throughout. The task pages follow the application,
so the landing page is now the odd one out.

## fr — the space before French punctuation is a breaking one

The French pages use a plain space (U+0020) before `:` `;` `!` `?` and inside
`« »`, which is what the landing page already does, so the task pages match it.
It is worth changing both together: French typography wants a narrow no-break
space (U+202F) or U+00A0 there, and a plain space lets a line wrap between the
word and the colon.

## es — the existing landing page uses both "disco" and "unidad" for a drive

`how.lead` says **disco**; `faq.2.a` and `faq.3.a` say **unidad** for the same
thing. The application says disco. The task pages use disco throughout.

Also **solo lectura** (the application, and Apple) against the landing page's
**solo en lectura** and **solo para lectura**, which are two more forms again.

## it — the site and the application disagree about "recovery key"

The site says **chiave di ripristino**; the application says **chiave di
recupero**. For a BitLocker key the site is right: ripristino is the term
Windows itself uses in Italian, and it is the phrase the reader will have seen
on the machine that encrypted the drive. The task pages follow the site, so the
application is the one to change.

## pt-PT — the site cannot decide whether Lukotta is masculine or feminine

**A Lukotta** appears nine times, **o Lukotta** six. The task pages use the
feminine throughout, since that is the majority and the name ends in -a, but
the landing page needs one of the two picked and applied everywhere.

## ro — two disagreements between the site and the application

**Locations**: the site says *Locații*, the application says *Amplasament*. The
site is right for the Finder sidebar, which is what both are naming.

**Register**: the site addresses the reader as *tu* (`scrie parola`), the
application as *dumneavoastră* (`Deblocați`). The task pages follow the site.
One of the two should move.

## Languages macOS is not offered in

Estonian, Latvian, Lithuanian, Albanian, Slovenian, Bulgarian and Filipino have
no macOS localisation, so the reader's own Mac shows **Finder**, **File**,
**Get Info**, **Format** and **Locations** in English. The task pages in those
languages keep those five in English and translate everything around them,
which is what the landing page already does for Estonian.

Note that Lukotta's own menu items are translated in all of them, so one
sentence legitimately mixes the two: an English *File* menu holding a menu item
in the reader's language.

## fi — two words for a disk image, and two for a drive

`features.body2` says **levytiedosto**, `faq.5.a` says **levykuva**. Apple's
Finnish and the application both say levytiedosto, which is what the task pages
use.

Separately the application says **asema** for a drive where the site says
**levy**. Apple's Finnish distinguishes them (asema is the drive, levy the
disk), so this one may be right as it stands, but it is worth a look.

## hu — "lemez" and "meghajtó" are used for the same thing

`how.lead` and `features.body2` say **lemez**; `faq.2.a` and `faq.3.a` say
**meghajtó**. Hungarian distinguishes them (lemez the disk, meghajtó the
drive), which the English also does, so the task pages keep meghajtó for a
drive and lemez for a disk. The landing page mixes them.

## lv — the landing page translates a name the reader's Mac shows in English

`how.3.body` says **sadaļā Atrašanās vietas** for the Finder sidebar's
Locations. macOS is not offered in Latvian, so that sidebar reads *Locations*
on the reader's own screen, and a translated name makes the instruction fail.
GLOSSARY.md already says to keep the English in this case.

The task pages keep **Locations**, so they and the landing page now differ.
The landing page is the one to change.

Also `how.lead` says **failu sistēmas** while `faq.3.a` says **datnes** for
files. The task pages use fails and failu sistēma throughout.

## cs — "jen pro čtení" against the application's "jen ke čtení"

Both are read-only and both are ordinary Czech. The site says the first, the
application the second. The task pages follow the site.

## pl — Polish declines product names, and the checker caught nine of them

Polish inflects foreign nouns and respells them doing it: *Linux* becomes
*Linuksa*, *VirtualBox* becomes *VirtualBoksa*. That is correct Polish, and it
is also no longer the string anyone types into a search box.

The landing page already avoids it by putting the name in apposition — `how.lead`
says **maszynę wirtualną z systemem Linux**, not *z Linuksem*. The task pages do
the same throughout. Worth confirming a Polish reader finds this natural rather
than stiff; if not, the trade is search visibility against fluency and somebody
has to pick.

## sl — the same translated-sidebar problem as Latvian, plus disk against pogon

`how.3.body` says **pod Lokacije**. macOS is not offered in Slovenian, so that
sidebar reads *Locations* on the reader's screen. The task pages keep the
English; the landing page should too.

Separately the site says **disk** for a drive and the application says
**pogon**. The task pages follow the site.

## Addresses in the languages that do not use the Latin alphabet

Bulgarian, Russian, Ukrainian, Greek, Hebrew, Arabic, Hindi, Thai, Korean,
Japanese and Chinese all get a Latin address rather than one in their own
script. Two reasons, and the second is the one that decides it:

The address becomes a directory name on the build machine, a line in the
sitemap and a URL submitted to IndexNow. macOS stores directory names in a
different Unicode normalisation from the one those files carry, so a non-ASCII
address quietly stops matching itself between the folder and the sitemap.

And the words being searched for in these pages — bitlocker, ntfs, ext4, vmdk —
are typed in Latin in every one of these languages anyway.

Worth a second opinion for Russian and Greek, where a native-script URL would
also be read correctly by the search engines those readers actually use.

## uk — "відмикати" on the site against "розблокувати" in the application

Both mean unlock. The site says the first, the application the second, and the
same reader meets both. The task pages follow the site.

## el — "κωδικός" on the site against "συνθηματικό" in the application

Both are used for a password in Greek software. The site says the first, the
application the second. The task pages follow the site.

## tr — "disk" and "sürücü" both used for a drive

`how.lead` and `features.body2` say **disk**; `faq.2.a` and `faq.3.a` say
**sürücü**. The task pages use disk for the object the reader is holding and
keep sürücü out of it. The landing page should settle on one.

## id — "berkas" in the prose, "file" in the search strings

The landing page uses **berkas** throughout and the task pages keep that in the
body. The titles, descriptions and addresses use **file**, because those are
written for search rather than translated, and file is what an Indonesian
reader types. Flagging the split so it is a decision rather than an oversight.

Separately the site says **hanya-baca** where the application says
**Baca-Saja** for read-only.

## fil — a third translated sidebar name

`how.3.body` says **Mga Lokasyon**. macOS is not offered in Filipino, so the
sidebar reads *Locations* on the reader's screen. Same fix as Latvian and
Slovenian. The task pages keep the English.

## vi — the site writes "khoá", the application writes "khóa"

Two accepted Vietnamese conventions for where the tone mark sits. The task
pages follow the site's spelling, but the two should agree.

## he — the site gives macOS and Lukotta both genders

`how.lead` says **macOS אינו יודע** and **Lukotta מפעיל**, both masculine.
`faq.2.a`, `faq.3.a` and `faq.5.a` say **macOS לא יודעת**, **Lukotta פותחת**
and **מחברת**, all feminine. The task pages use the feminine throughout, taking
מערכת and תוכנה as the implied nouns, but the landing page needs one gender
picked and applied to both names everywhere.

## ar — "قرص" on the site against "محرك الأقراص" in the application

The site calls a drive قرص throughout; the application says محرك الأقراص. The
task pages follow the site, which is also the shorter and more readable of the
two in running prose.

## th — "กุญแจกู้คืน" on the site against "คีย์กู้คืน" in the application

Both render recovery key. The task pages follow the site.

Note also that Thai writes without spaces between words, so the 70-to-160
character window for a description holds far more Thai than English. The Thai
descriptions sit near the lower end of it and are not short.

## ja — two words for read-only

`features.body2` says **読み出し専用**, `faq.3.a` says **読み取り専用**. The
application and Apple's own Disk Utility say 読み出し専用, which is what the
task pages use.
