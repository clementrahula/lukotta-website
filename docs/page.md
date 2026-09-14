# The page

## Audience and copy

- A public marketing and download site for a macOS application.
- The page is where somebody decides whether to install. A broken or wrong page loses that user before they run anything.
- It is judged as a stranger who has never heard of the product would read it.
- Every claim is true to what the application does. A claim the product does not honour is worse than a broken link.
- Pages and copy are the owner's words: new files under `content/pages/`, `content/site/` and `src/pages/` are written by the owner.

## About and Contact

- The two pages in `content/site/` are rendered by the guide machinery but are not guides and do not read like them.
- Neither carries a `lead`.
- About headings: *Why it exists*, *Who created and maintains it*.
- Contact headings: *Bugs, suggestions and translations*, *Security problems*, with the response-time caveat above both.
- No one-paragraph subsection per idea: that read as a brochure, not one person writing.
- `lead` is optional wherever a page is rendered or translated: `page.mjs`, `taskMarkdown` in `build.mjs`, `delta-translate.mjs` and `export-translations.mjs` skip it when absent. The four guides have one. A page without `lead` is a valid shape.
- About credits `anylinuxfs`, which Lukotta is built on. It is in `verbatim.mjs` and `GLOSSARY.md`, lowercase; a translation that respells it is a finding.

## The language menu

- On a guide, About and Contact, the menu links to that page in each language, not to each language's front page. Linking to front pages threw away the reader's place.
- `menuHrefs()` in `build.mjs` builds the list from each language's slug for the page; `renderTaskPage` takes it as `langHrefs`.
- It is not the `hreflang` list: that one carries absolute URLs and the `alsoServes` region aliases, and is read by search engines.
- A language without a version of the page falls back to its landing page, not a 404.
- Landing pages and the 404 list front pages.

## The early-development notice

- `how.warning.*` closes the How It Works section on the landing page, in the same `.aside` box the formats section ends with.
- Not above the formats table: there it read as a caveat about the formats rather than the application.
- It is also in `llms.txt` and every `index.md`, under How it works.

## Assets

- Two screenshots per language: `src/assets/screenshots/<code>/{light,dark}.webp`, the pair the same size.
- Lossless WebP (`cwebp -lossless`) from 1160x1264 captures, shown at 720px.
- The build reads dimensions from the WebP header and writes them onto the `<img>`.
- A language without its own pair falls back to English; the build reports which.
- Both appearances are in the page and cross-fade: about 150 kB of screenshot per page.
- Neither `<img>` carries `fetchpriority`: which one is drawn is unknown until `prefers-color-scheme` is evaluated. On both, it queued 75 kB of invisible screenshot ahead of the stylesheet and font; on one, it inverts the problem for the other appearance.
- Priority is two `rel="preload"` links in the `<head>` carrying the appearance's media query. The browser fetches only the one it paints. Without them the largest paint falls back behind the preload scanner.
- The macOS window frame (`.shot`, `.shot-bar`) uses macOS measurements: 28pt title bar, 12pt buttons 8pt apart, 20pt from the leading edge, 10pt corner. It stays when the layout changes.
- Only `assets/brand/lukotta-mark-{light,dark}.png` ship. The rest of `src/assets/brand/` are the originals the favicons and the shared-card image in `src/assets/icons/` were generated from with `sips`: kept, not published.

## Styles

- `--ink-3`, `--amber-ink`, `--control-edge` and the focus ring were set by measurement. `check.mjs` re-checks the ratios.
- The dark appearance is declared twice: under `@media (prefers-color-scheme: dark)` for a reader whose JavaScript never ran, and under `[data-theme="dark"]` for a reader who chose. Everything that differs between appearances goes through a token. `check.mjs` compares the two.

## Scripts on the page

- The inline scripts carry `data-cfasync="false"`. Rocket Loader is off, but it is a dashboard toggle; turned on, it would stop the first script resolving the appearance before first paint and the second being in place before `script.js` reads it.
- `build.mjs` hashes every inline script into the content policy in the `<head>`; an edited script gets its new hash automatically.
- No inline style attributes: they would need the policy widened.
- Cloudflare injects `__CF$cv$params`, and the policy blocks it; the console records a violation on every page load. Decided and left:
  - its values are per request, so no hash can cover it
  - it is bot telemetry; nothing on the page depends on it
  - `unsafe-inline` gives up the policy
  - stripping it means an HTML rewriter in the worker on every page
  - turning Rocket Loader off did not remove it; no zone setting controls it
