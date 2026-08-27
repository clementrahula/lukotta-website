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
