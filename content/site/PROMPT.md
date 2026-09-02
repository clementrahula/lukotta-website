# Reviewing the rewritten About and Contact pages on the Lukotta website

You are reviewing translations into thirty-six languages of material that was
rewritten on the Lukotta website, not material that is new to it.

Lukotta is a free and open-source macOS application that opens BitLocker, NTFS,
LUKS, Linux and virtual-machine disks which macOS cannot read by itself.

**This pack is a delta.** It holds only what changed in this round: the About
page, the Contact page, three strings on the landing page and one line on the
404 page. 25 strings per language. The four guides and the rest of the landing
page have not changed and are not here. Do not ask for them.

## What you have

| File | What it holds |
| --- | --- |
| `<code>.json` | One language. Every string with its identifier, where it appears, the English, and the translation. |
| `GLOSSARY.md` | Words that are not free to translate, and why. |
| `README.md` | The rules a translation on this site is judged by. |
| `INDEX.md` | The list of languages. |

## What changed, and why it matters to the reading

**About and Contact were rewritten from scratch.** The previous versions were
marketing copy: a one-line summary under the heading, then a run of
three-line subsections, each making a claim about the product. They repeated
the landing page and said very little that was true of this project in
particular.

What replaced them is one person talking. About is now two sections, *Why it
exists* and *Who created and maintains it*, and it says plainly that the hard
part of the work was solved by somebody else: Lukotta is built on `anylinuxfs`,
which is credited by name and linked. Contact is two sections, *Bugs,
suggestions and translations* and *Security problems*, with the caveat about
response times above both.

**The landing page gained an early-development notice**, at the end of How It
Works. It says the application is new, that reading drives is the safe use of
it for now, and that writing should be treated as experimental. This is the
most consequential text in the pack: somebody deciding whether to trust the
application with a drive will read it, and a translation that softens it is a
safety problem rather than a style problem.

Read the whole pack in that light. These pages are read by people deciding
whether unknown software is safe to run, and by machines deciding whether it is
real enough to recommend. Both want the same thing: plain facts, quickly.

## What to look for, in order of how much it matters

1. **Warnings that changed strength.** `how.warning.body` tells the reader that
   writing is experimental and to keep a copy of anything they would be upset to
   lose. A translation that hedges that, or that firms it up into a promise that
   nothing will go wrong, is a factual error. The same applies to *Reading
   drives is reliable; writing to them is still experimental* on the About page,
   and to *do not include a password or a recovery key* on Contact.
2. **Meaning that has drifted.** The English is canonical. Where the two
   disagree, the translation is wrong.
3. **Credit that has gone missing.** The About page exists partly to credit
   `anylinuxfs`. It is lowercase, it stays in Latin script, and the sentence
   must still read as crediting somebody else's work rather than describing a
   component.
4. **Names that should not have been translated.** BitLocker, NTFS, LUKS, ext4,
   btrfs, XFS, qcow2, VMDK, VDI, VHD, VHDX, macOS, Windows, Linux, anylinuxfs,
   and the name Lukotta itself. Several languages declined the product name on
   an earlier pass, into Lukottu, Lukotcie, Lukotassa. The site never does this
   in any language: it puts the name in apposition instead — *aplikace Lukotta*,
   *rakenduse Lukotta*, *программу Lukotta*. Check yours has not.
5. **Finder.** This one is the opposite case. Apple translates it, and Chinese
   macOS calls it 访达. Use whatever that language's macOS calls it, and keep
   the English in the seven languages macOS is not offered in: Estonian,
   Latvian, Lithuanian, Albanian, Slovenian, Bulgarian and Filipino.
6. **`[text](url)` links.** Two paragraphs on About carry one each. The words in
   the brackets are what the reader clicks and should read naturally in the
   sentence; the address in the parentheses must not change.
7. **The two descriptions.** `about.description` and `contact.description` never
   appear on the page. They are the second line of a search result, written for
   somebody typing their problem into a search engine, so judge them by whether
   those are the words that person would type. Between 70 and 160 characters.
8. **Register.** The English is plain to the point of blunt, and first person
   throughout. It says the application is unfinished and that replies are not
   guaranteed. A translation that makes the project sound larger, safer or more
   professional than it is has broken it.

## What is deliberately not here

The addresses did not move. Every `slug` is the one that language already had,
because each is an indexed URL and moving one retires it. They are not in this
pack and are not up for review.

## What not to do

- **Do not rewrite what is already correct.**
- **Do not raise the register.** There is no marketing here and there should be
  none in the translation.
- **Do not silently improve.** Every change is a numbered finding with a reason.

## How to answer

One block per finding. Nothing else.

```
FINDING <n>
language:   <code>
key:        <the identifier, e.g. about.s0.p2>
severity:   error | safety | wrong-register | unnatural | terminology | seo | question
current:    <the translation as it stands>
proposed:   <your replacement, or — if you are only raising a question>
because:    <what is wrong. Not "reads better".>
confidence: high | medium | low
```

- **`because` decides whether the change is made.** Say *what* is wrong.
- Use **`severity: safety`** for anything that weakens the experimental-writing
  warning or the instruction never to paste a password or recovery key.
- Use **`severity: question`** freely when you are unsure. A well-aimed question
  beats a confident guess.
- If a language has no findings, write `<code>: no findings` on one line.

## Do this in as many runs as it takes

Thirty-six languages is more than fits in one run, and a model that tries it all
at once tends to go quiet in the middle and produce nothing usable.

- **One language per run.** Finish it properly.
- **Write the file at the end of every run.** Name them `findings-<code>.md`.
  A run that ends without writing its file is a run that never happened.
- **End every file with `## Where this run stopped`.**
