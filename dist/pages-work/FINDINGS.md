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
