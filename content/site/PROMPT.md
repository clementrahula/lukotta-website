# Reviewing three new pages on the Lukotta website

You are reviewing translations into thirty-six languages of material added to
the Lukotta website after the last review pack.

Lukotta is a free and open-source macOS application that opens BitLocker, NTFS,
LUKS, Linux and virtual-machine disks which macOS cannot read by itself.

**This pack is a delta.** It holds three pages and nothing else: the 404 page,
an About page and a Contact page. 51 strings per language. The landing page and
the four guides went out in the previous pack, have not changed, and are not
here. Do not ask for them.

## What you have

| File | What it holds |
| --- | --- |
| `<code>.json` | One language. Every string with its identifier, where it appears, the English, and the translation. |
| `GLOSSARY.md` | Words that are not free to translate, and why. |
| `README.md` | The rules a translation on this site is judged by. |
| `INDEX.md` | The list of languages. |

## Why these pages exist

An audit of how well an ordinary AI agent can use the site scored it 79 out of
100. A second report explained the shape of the loss: an agent asked what
lukotta.com is for could not answer from the site and fell back on web search.

Two of the gaps it named are what these pages fix. A 404 that says only that an
address is wrong leaves an agent with nowhere to go, so the new one names the
sitemap, llms.txt and every guide. And an agent deciding whether software from
an unknown name can be recommended to somebody looks for an About page and a
Contact page; finding neither is an answer in itself.

Keep that in mind while reading. These pages are read by people who have landed
somewhere unexpected, and by machines deciding whether this software is real.
Both want the same thing: plain facts, quickly.

## What to look for, in order of how much it matters

1. **Meaning that has drifted.** The English is canonical. Where the two
   disagree, the translation is wrong.
2. **Claims that changed strength.** These pages make flat statements: nothing
   leaves your Mac, there is no company, there is no promised response time,
   some messages go unanswered. A translation that softens or hedges one of
   those is a factual error, not a stylistic one. So is one that hardens it.
3. **Names that should not have been translated.** BitLocker, NTFS, LUKS, ext4,
   btrfs, XFS, qcow2, VMDK, VDI, VHD, VHDX, macOS, Windows, Linux, and the name
   Lukotta itself. Several languages declined the product name on the first
   pass, into Lukottu, Lukotcie, Lukotassa. The site never does this in any
   language: it puts the name in apposition instead. Check yours has not.
4. **Finder.** This one is the opposite case. Apple translates it, and Chinese
   macOS calls it 访达. Use whatever that language's macOS calls it, and keep
   the English in the seven languages macOS is not offered in: Estonian,
   Latvian, Lithuanian, Albanian, Slovenian, Bulgarian and Filipino.
5. **The addresses.** Each page has a `slug`, which is its address, and it is
   translated: `about` becomes `ueber` in German and `a-propos` in French. It
   is lowercase a-z, 0-9 and single hyphens in every language, including those
   that do not use the Latin alphabet, because it becomes a directory name on
   the build machine as well as a URL. Judge it by whether it is what somebody
   would type.
6. **`[text](url)` links.** One paragraph carries one. The words in the
   brackets are what the reader clicks and should read naturally in the
   sentence; the address in the parentheses must not change.
7. **Register.** The English is plain to the point of blunt. It says replies
   can be slow and some messages go unanswered. A translation that makes the
   project sound larger or more professional than it is has broken it.

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
id:         <the identifier, e.g. about.s2.p1>
severity:   error | wrong-register | unnatural | terminology | seo | question
current:    <the translation as it stands>
proposed:   <your replacement, or — if you are only raising a question>
because:    <what is wrong. Not "reads better".>
confidence: high | medium | low
```

- **`because` decides whether the change is made.** Say *what* is wrong.
- Use **`severity: question`** freely when you are unsure. A well-aimed question
  beats a confident guess.
- If a language has no findings, write `<code>: no findings` on one line.

## Do this in as many runs as it takes

Thirty-six languages at 51 strings each is more than fits in one run, and a
model that tries it all at once tends to go quiet in the middle and produce
nothing usable.

- **One language per run.** Finish it properly.
- **Write the file at the end of every run.** Name them `findings-<code>.md`.
  A run that ends without writing its file is a run that never happened.
- **End every file with `## Where this run stopped`.**
