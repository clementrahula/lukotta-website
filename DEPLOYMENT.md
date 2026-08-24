# Deploying lukotta.com

The site is static. GitHub Actions builds `public/` and GitHub Pages serves it,
behind Cloudflare.

## Where things stand

- The repository is **private**, so Pages will not serve it. GitHub Pages
  publishes a private repository only on a paid plan.
- The DNS for `lukotta.com` is already set up in Cloudflare.
- `.github/workflows/deploy.yml` is written and will run on the first push to
  `main`. Until the repository is public, its build and check steps pass and the
  deploy step fails. That is expected and harmless.

## Going live

1. **Make the repository public.**
   Settings → General → Danger Zone → Change visibility → Public.

2. **Turn Pages on.**
   Settings → Pages → Build and deployment → Source: **GitHub Actions**.
   Not "Deploy from a branch" — the site is built, not committed.

3. **Set the custom domain.**
   Settings → Pages → Custom domain → `lukotta.com` → Save.
   The build already writes `public/CNAME`, so this should stick on the first
   deploy. Leave **Enforce HTTPS** on once the certificate is issued.

4. **Point Cloudflare at Pages.**

   | Type | Name | Content | Proxy |
   | --- | --- | --- | --- |
   | `A` | `lukotta.com` | `185.199.108.153` | see below |
   | `A` | `lukotta.com` | `185.199.109.153` | |
   | `A` | `lukotta.com` | `185.199.110.153` | |
   | `A` | `lukotta.com` | `185.199.111.153` | |
   | `CNAME` | `www` | `clementrahula.github.io` | |

   **Set the SSL/TLS encryption mode to Full (strict)** before turning the orange
   cloud on. Cloudflare's default on some accounts is Flexible, which sends
   plain HTTP to GitHub while telling the reader the connection is secure, and
   GitHub answers a Flexible request with a redirect loop.

   Leave the records **grey (DNS only)** until GitHub has issued its
   certificate — GitHub validates the domain over HTTP and cannot do it through
   the proxy. Once Pages reports the certificate as issued, switch the proxy on.

5. **Run the checks against the live site.**

   ```bash
   curl -sI https://lukotta.com | head -1
   curl -s https://lukotta.com/robots.txt
   curl -s https://lukotta.com/sitemap.xml | head -20
   ```

6. **Submit the sitemap** in Google Search Console and Bing Webmaster Tools,
   for `https://lukotta.com/sitemap.xml`. Search Console will report the
   `hreflang` cluster under International Targeting; it should list every
   language with no return-tag errors.

## What the build guarantees

`node scripts/check.mjs` runs in CI before anything is published, and fails on:

- a missing or wrong canonical
- an incomplete `hreflang` cluster, a missing self-reference, or no `x-default`
- two languages sharing a title or a description
- a local `href` or `src` that is not in `public/`
- an `<img>` with no alt text, or a page without exactly one `<h1>`
- JSON-LD that does not parse
- a page whose `lang` or `dir` disagrees with `site.config.json`
- a sitemap that does not list every page built

## Rolling back

Re-run an earlier successful **Deploy** workflow from the Actions tab. The site
is rebuilt from that commit; there is no state to restore.
