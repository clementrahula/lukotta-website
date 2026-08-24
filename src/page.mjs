/* Renders one language's page. Everything visible comes from content/<lang>.json
   by key, so a string that is not in that file cannot reach the page. */

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/* JSON-LD is dropped into a <script> element, so the one sequence that can end
   that element early has to go. */
const jsonld = (obj) => JSON.stringify(obj, null, 2).replace(/</g, "\\u003c");

export function renderPage({ lang, cfg, t, alternates, canonical, assetPrefix, shotSize, buildable }) {
  const { dir, code, native } = lang;
  const rtl = dir === "rtl";
  const year = new Date().getUTCFullYear();

  const A = (p) => `${assetPrefix}assets/${p}`;
  const shot = (variant) => `${assetPrefix}assets/screenshots/${lang.code}/${variant}.png`;

  /* ------------------------------------------------------------- head -- */

  const hreflang = alternates
    .map(
      (a) =>
        `  <link rel="alternate" hreflang="${a.code}" href="${a.href}">`
    )
    .join("\n");

  const ogAlternates = buildable
    .filter((l) => l.code !== code)
    .map((l) => `  <meta property="og:locale:alternate" content="${l.ogLocale}">`)
    .join("\n");

  const softwareLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Lukotta",
    url: `${cfg.domain}/`,
    applicationCategory: "UtilitiesApplication",
    applicationSubCategory: "Disk Utility",
    operatingSystem: "macOS 15 Sequoia or later",
    processorRequirements: "Apple Silicon (arm64)",
    softwareVersion: cfg.appVersion,
    inLanguage: code,
    description: t("meta.description"),
    downloadUrl: cfg.downloadUrl,
    installUrl: cfg.downloadUrl,
    license: "https://www.gnu.org/licenses/gpl-3.0.html",
    isAccessibleForFree: true,
    image: `${cfg.domain}/assets/og.png`,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
    },
    author: {
      "@type": "Person",
      name: cfg.authorName,
      url: cfg.authorUrl,
    },
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: code,
    mainEntity: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
      "@type": "Question",
      name: t(`faq.${n}.q`),
      acceptedAnswer: { "@type": "Answer", text: t(`faq.${n}.a`) },
    })),
  };

  const siteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Lukotta",
    url: `${cfg.domain}/`,
    inLanguage: code,
    publisher: { "@type": "Person", name: cfg.authorName, url: cfg.authorUrl },
  };

  /* ------------------------------------------------------------- parts -- */

  const dl = (prefix, count) =>
    Array.from({ length: count }, (_, i) => i + 1)
      .map(
        (n) => `          <div>
            <dt>${esc(t(`${prefix}.${n}.term`))}</dt>
            <dd>${esc(t(`${prefix}.${n}.def`))}</dd>
          </div>`
      )
      .join("\n");

  const check = `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13.5 4.5 6.5 11.5 2.5 7.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  const langLinks = buildable
    .map((l) => {
      const href = l.path ? `${cfg.domain}/${l.path}/` : `${cfg.domain}/`;
      const current = l.code === code ? ` aria-current="true"` : "";
      return `            <li><a href="${href}" hreflang="${l.code}" lang="${l.code}"${current}>${esc(l.native)}</a></li>`;
    })
    .join("\n");

  const footerLangLinks = buildable
    .map((l) => {
      const href = l.path ? `${cfg.domain}/${l.path}/` : `${cfg.domain}/`;
      return `          <li><a href="${href}" hreflang="${l.code}" lang="${l.code}">${esc(l.native)}</a></li>`;
    })
    .join("\n");

  const faqItems = [1, 2, 3, 4, 5, 6, 7, 8]
    .map(
      (n) => `        <details${n === 1 ? " open" : ""}>
          <summary>${esc(t(`faq.${n}.q`))}</summary>
          <div class="answer">${esc(t(`faq.${n}.a`))}</div>
        </details>`
    )
    .join("\n");

  const features = [1, 2, 3, 4, 5, 6]
    .map(
      (n) => `        <li class="card">
          <h3>${esc(t(`features.${n}.title`))}</h3>
          <p>${esc(t(`features.${n}.body`))}</p>
        </li>`
    )
    .join("\n");

  const steps = [1, 2, 3]
    .map(
      (n) => `        <li class="step">
          <h3>${esc(t(`how.${n}.title`))}</h3>
          <p>${esc(t(`how.${n}.body`))}</p>
        </li>`
    )
    .join("\n");

  const requirements = [1, 2, 3, 4]
    .map((n) => `          <li>${esc(t(`requirements.${n}`))}</li>`)
    .join("\n");

  const trust = [1, 2, 3, 4]
    .map((n) => `          <li>${check}${esc(t(`trust.${n}`))}</li>`)
    .join("\n");

  const sunIcon = `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="3.1" stroke="currentColor" stroke-width="1.5"/><path d="M8 1v1.6M8 13.4V15M15 8h-1.6M2.6 8H1m11-5-1.1 1.1M5.1 10.9 4 12m8 0-1.1-1.1M5.1 5.1 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  const moonIcon = `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13.5 9.6A5.9 5.9 0 0 1 6.4 2.5a5.9 5.9 0 1 0 7.1 7.1Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
  const autoIcon = `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6.1" stroke="currentColor" stroke-width="1.5"/><path d="M8 1.9A6.1 6.1 0 0 1 8 14.1Z" fill="currentColor"/></svg>`;
  const globeIcon = `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6.2" stroke="currentColor" stroke-width="1.4"/><path d="M1.8 8h12.4M8 1.8c1.7 1.8 2.6 3.9 2.6 6.2S9.7 12.4 8 14.2C6.3 12.4 5.4 10.3 5.4 8s.9-4.4 2.6-6.2Z" stroke="currentColor" stroke-width="1.4"/></svg>`;

  /* -------------------------------------------------------------- html -- */

  return `<!doctype html>
<html lang="${code}" dir="${dir}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

  <title>${esc(t("meta.title"))}</title>
  <meta name="description" content="${esc(t("meta.description"))}">
  <link rel="canonical" href="${canonical}">

  <meta name="theme-color" content="#FBF9F5" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#16181E" media="(prefers-color-scheme: dark)">
  <meta name="color-scheme" content="light dark">
  <meta name="apple-mobile-web-app-title" content="Lukotta">
  <meta name="format-detection" content="telephone=no">

${hreflang}

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Lukotta">
  <meta property="og:url" content="${canonical}">
  <meta property="og:title" content="${esc(t("meta.ogTitle"))}">
  <meta property="og:description" content="${esc(t("meta.ogDescription"))}">
  <meta property="og:image" content="${cfg.domain}/assets/og.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(t("meta.imageAlt"))}">
  <meta property="og:locale" content="${lang.ogLocale}">
${ogAlternates}

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(t("meta.ogTitle"))}">
  <meta name="twitter:description" content="${esc(t("meta.ogDescription"))}">
  <meta name="twitter:image" content="${cfg.domain}/assets/og.png">

  <link rel="icon" href="${A("favicon-32.png")}" sizes="32x32" type="image/png">
  <link rel="icon" href="${A("favicon-16.png")}" sizes="16x16" type="image/png">
  <link rel="apple-touch-icon" href="${A("apple-touch-icon.png")}">
  <link rel="manifest" href="${assetPrefix}site.webmanifest">

  <link rel="stylesheet" href="${assetPrefix}styles.css">
  <link rel="preload" as="image" href="${shot("light")}" media="(prefers-color-scheme: light)">
  <link rel="preload" as="image" href="${shot("dark")}" media="(prefers-color-scheme: dark)">

  <script>
    /* Resolve the appearance before the first paint, so the page never flashes
       the wrong one. The rest of the behaviour lives in script.js. */
    (function () {
      try {
        var c = localStorage.getItem("lukotta-theme") || "auto";
        var d = c === "dark" || (c === "auto" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
        document.documentElement.setAttribute("data-theme", d ? "dark" : "light");
        document.documentElement.setAttribute("data-theme-choice", c);
      } catch (e) {}
    })();
  </script>

  <script type="application/ld+json">${jsonld(softwareLd)}</script>
  <script type="application/ld+json">${jsonld(faqLd)}</script>
  <script type="application/ld+json">${jsonld(siteLd)}</script>
</head>
<body>
  <a class="skip-link" href="#main">${esc(t("ui.skipToContent"))}</a>

  <header class="site-header">
    <div class="wrap header-inner">
      <a class="brand" href="${canonical}">
        <picture>
          <source data-theme-source srcset="${A("brand/lukotta-mark-dark.png")}" media="(prefers-color-scheme: dark)">
          <img src="${A("brand/lukotta-mark-light.png")}" alt="" width="25" height="25" decoding="async">
        </picture>
        Lukotta
      </a>

      <nav class="site-nav" aria-label="${esc(t("ui.menu"))}">
        <a href="#opens">${esc(t("nav.opens"))}</a>
        <a href="#how">${esc(t("nav.how"))}</a>
        <a href="#features">${esc(t("nav.features"))}</a>
        <a href="#privacy">${esc(t("nav.privacy"))}</a>
        <a href="#faq">${esc(t("nav.faq"))}</a>
      </nav>

      <div class="header-tools">
        <div class="segmented" role="radiogroup" aria-label="${esc(t("ui.appearance"))}">
          <button type="button" role="radio" aria-checked="false" data-set-theme="auto"  title="${esc(t("ui.themeAuto"))}"  aria-label="${esc(t("ui.themeAuto"))}">${autoIcon}</button>
          <button type="button" role="radio" aria-checked="false" data-set-theme="light" title="${esc(t("ui.themeLight"))}" aria-label="${esc(t("ui.themeLight"))}">${sunIcon}</button>
          <button type="button" role="radio" aria-checked="false" data-set-theme="dark"  title="${esc(t("ui.themeDark"))}"  aria-label="${esc(t("ui.themeDark"))}">${moonIcon}</button>
        </div>

        <details class="lang">
          <summary aria-label="${esc(t("ui.chooseLanguage"))}">${globeIcon}<span>${esc(native)}</span></summary>
          <div class="lang-panel">
            <ul class="lang-list">
${langLinks}
            </ul>
          </div>
        </details>

        <a class="btn btn-primary btn-sm" href="${cfg.downloadUrl}">${esc(t("nav.download"))}</a>
      </div>
    </div>
  </header>

  <main id="main">

    <section class="hero">
      <div class="wrap">
        <div class="hero-inner">
          <p class="eyebrow">${esc(t("hero.eyebrow"))}</p>
          <h1>${esc(t("hero.title"))}</h1>
          <p class="hero-sub">${esc(t("hero.subtitle"))}</p>
          <div class="hero-actions">
            <a class="btn btn-primary" href="${cfg.downloadUrl}">${esc(t("hero.download"))}</a>
            <a class="btn btn-secondary" href="${cfg.githubRepo}">${esc(t("hero.source"))}</a>
          </div>
          <p class="hero-note">${esc(t("hero.downloadNote"))}</p>
          <ul class="trust">
${trust}
          </ul>
        </div>

        <div class="shot">
          <figure class="window">
            <div class="window-bar" aria-hidden="true">
              <i></i><i></i><i></i><span>Lukotta</span>
            </div>
            <picture>
              <source data-theme-source srcset="${shot("dark")}" media="(prefers-color-scheme: dark)">
              <img src="${shot("light")}" alt="${esc(t("hero.screenshotAlt"))}" width="${shotSize.width}" height="${shotSize.height}" fetchpriority="high" decoding="async">
            </picture>
          </figure>
        </div>
      </div>
    </section>

    <section id="opens" class="band">
      <div class="wrap">
        <div class="section-head">
          <h2>${esc(t("opens.title"))}</h2>
          <p>${esc(t("opens.subtitle"))}</p>
        </div>

        <div class="formats">
          <article class="format-card">
            <h3>${esc(t("opens.drives.title"))}</h3>
            <dl>
${dl("opens.drives", 5)}
            </dl>
          </article>
          <article class="format-card">
            <h3>${esc(t("opens.images.title"))}</h3>
            <dl>
${dl("opens.images", 3)}
            </dl>
          </article>
        </div>

        <p class="note">${esc(t("opens.note"))}</p>

        <div class="callout">
          <strong>${esc(t("opens.warning.title"))}</strong>
          <p>${esc(t("opens.warning.body"))}</p>
        </div>

        <p class="note"><a href="${cfg.githubRepo}/blob/main/SPECS.md">${esc(t("opens.specs"))}</a></p>
      </div>
    </section>

    <section id="how">
      <div class="wrap">
        <div class="section-head">
          <h2>${esc(t("how.title"))}</h2>
          <p>${esc(t("how.subtitle"))}</p>
        </div>
        <ol class="steps">
${steps}
        </ol>
        <p class="note">${esc(t("how.networkNote"))}</p>
      </div>
    </section>

    <section id="features" class="band">
      <div class="wrap">
        <div class="section-head">
          <h2>${esc(t("features.title"))}</h2>
          <p>${esc(t("features.subtitle"))}</p>
        </div>
        <ul class="grid-3">
${features}
        </ul>
      </div>
    </section>

    <section id="privacy">
      <div class="wrap split">
        <div>
          <h2>${esc(t("privacy.title"))}</h2>
          <p>${esc(t("privacy.body"))}</p>
          <div class="inline-links">
            <a href="${cfg.githubRepo}/blob/main/PRIVACY.md">${esc(t("privacy.link.privacy"))}</a>
            <a href="${cfg.githubRepo}/blob/main/SECURITY.md">${esc(t("privacy.link.security"))}</a>
          </div>
        </div>
        <div>
          <h3>${esc(t("permissions.title"))}</h3>
          <dl class="plain-list">
            <li>
              <dt>${esc(t("permissions.1.term"))}</dt>
              <dd>${esc(t("permissions.1.def"))}</dd>
            </li>
            <li>
              <dt>${esc(t("permissions.2.term"))}</dt>
              <dd>${esc(t("permissions.2.def"))}</dd>
            </li>
            <li>
              <dt>${esc(t("permissions.3.term"))}</dt>
              <dd>${esc(t("permissions.3.def"))}</dd>
            </li>
          </dl>

          <h3 style="margin-top:32px">${esc(t("requirements.title"))}</h3>
          <ul class="plain-list">
${requirements}
          </ul>
        </div>
      </div>
    </section>

    <section id="faq" class="band">
      <div class="wrap">
        <div class="section-head">
          <h2>${esc(t("faq.title"))}</h2>
        </div>
        <div class="faq">
${faqItems}
        </div>
      </div>
    </section>

    <section class="cta">
      <div class="wrap">
        <h2>${esc(t("download.title"))}</h2>
        <p>${esc(t("download.body"))}</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="${cfg.downloadUrl}">${esc(t("download.cta"))}</a>
        </div>
        <p class="hero-note">${esc(t("download.note"))}</p>
      </div>
    </section>

  </main>

  <footer class="site-footer">
    <div class="wrap">
      <div class="footer-top">
        <div class="footer-brand">
          <picture>
            <source data-theme-source srcset="${A("brand/lukotta-mark-dark.png")}" media="(prefers-color-scheme: dark)">
            <img src="${A("brand/lukotta-mark-light.png")}" alt="Lukotta" width="30" height="30" loading="lazy" decoding="async">
          </picture>
          <p>${esc(t("footer.tagline"))}</p>
        </div>

        <div>
          <h2>${esc(t("footer.project"))}</h2>
          <nav><ul>
            <li><a href="${cfg.githubRepo}">${esc(t("footer.source"))}</a></li>
            <li><a href="${cfg.githubRepo}/releases">${esc(t("footer.releases"))}</a></li>
            <li><a href="${cfg.githubRepo}/issues">${esc(t("footer.issues"))}</a></li>
            <li><a href="${cfg.githubRepo}/blob/main/SPECS.md">${esc(t("footer.specs"))}</a></li>
          </ul></nav>
        </div>

        <div>
          <h2>${esc(t("footer.legal"))}</h2>
          <nav><ul>
            <li><a href="${cfg.githubRepo}/blob/main/PRIVACY.md">${esc(t("footer.privacy"))}</a></li>
            <li><a href="${cfg.githubRepo}/blob/main/SECURITY.md">${esc(t("footer.security"))}</a></li>
            <li><a href="${cfg.githubRepo}/blob/main/LICENSE.txt">${esc(t("footer.licence"))}</a></li>
            <li><a href="${cfg.githubRepo}/blob/main/TRADEMARKS.txt">${esc(t("footer.trademarks"))}</a></li>
          </ul></nav>
        </div>

        <div>
          <h2>${esc(t("footer.support"))}</h2>
          <nav><ul>
            <li><a href="mailto:${cfg.supportEmail}">${cfg.supportEmail}</a></li>
          </ul></nav>
        </div>
      </div>

      <div class="footer-langs">
        <h2>${esc(t("footer.translations"))}</h2>
        <p>${esc(t("footer.translationsBody"))}</p>
        <ul>
${footerLangLinks}
        </ul>
      </div>

      <div class="footer-bottom">
        <span>${esc(t("footer.copyright"))}</span>
        <span>${esc(t("footer.trademarkNote"))}</span>
      </div>
    </div>
  </footer>

  <script src="${assetPrefix}script.js" defer></script>
</body>
</html>
`;
}
