/* Renders one language's page. Everything visible comes from content/<lang>.json
   by key, so a string that is not in that file cannot reach the page.

   The exceptions are format names — BitLocker, ext4, qcow2, VHDX — which are
   product names and are never translated in any script, so they live here. */

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const jsonld = (obj) => JSON.stringify(obj, null, 2).replace(/</g, "\\u003c");

/* The support table. Read and write are facts from the application's SPECS.md,
   not claims made here. */
const FORMATS = [
  {
    group: "formats.group.encryption",
    rows: [
      { name: "BitLocker", read: 1, write: 1, note: "formats.bitlocker.note" },
      { name: "LUKS1, LUKS2", read: 1, write: 1, note: "formats.luks.note" },
      { name: "LVM inside LUKS", read: 1, write: 1, note: "formats.lvm.note" },
    ],
  },
  {
    group: "formats.group.filesystems",
    rows: [
      { name: "NTFS", read: 1, write: 1, note: "formats.ntfs.note" },
      { name: "ext2, ext3, ext4, btrfs, XFS", read: 1, write: 1, note: "formats.linuxfs.note" },
      { name: "exFAT, FAT", read: 1, write: 1, note: "formats.exfat.note" },
    ],
  },
  {
    group: "formats.group.images",
    rows: [
      { name: "IMG, DMG", read: 1, write: 1, note: "formats.raw.note" },
      { name: "qcow2", read: 1, write: 1, note: "formats.qcow2.note" },
      { name: "VMDK", read: 1, write: 1, note: "formats.vmdk.note" },
      { name: "VMDK, stream-optimized", read: 1, write: 0, note: "formats.vmdkStream.note" },
      { name: "VDI", read: 1, write: 1, note: "formats.vdi.note" },
      { name: "VHD", read: 1, write: 1, note: "formats.vhd.note" },
      { name: "VHDX", read: 1, write: 0, note: "formats.vhdx.note" },
    ],
  },
];

export function renderPage({ lang, cfg, t, alternates, canonical, assetPrefix, shotSize, buildable, indexable }) {
  const { dir, code, native } = lang;

  const A = (p) => `${assetPrefix}assets/${p}`;
  const shot = (v) => `${assetPrefix}assets/screenshots/${lang.code}/${v}.png`;

  /* ------------------------------------------------------------- head -- */

  const hreflang = alternates
    .map((a) => `  <link rel="alternate" hreflang="${a.code}" href="${a.href}">`)
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
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR", availability: "https://schema.org/InStock" },
    author: { "@type": "Person", name: cfg.authorName, url: cfg.authorUrl },
  };

  const FAQ_NS = [1, 2, 3, 4, 5, 6];

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: code,
    mainEntity: FAQ_NS.map((n) => ({
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

  const tick = (on, label) =>
    on
      ? `<span class="mark yes" aria-hidden="true">✓</span><span class="visually-hidden">${esc(label.yes)}</span>`
      : `<span class="mark no" aria-hidden="true">—</span><span class="visually-hidden">${esc(label.no)}</span>`;

  const label = { yes: t("formats.yes"), no: t("formats.no") };

  const tableRows = FORMATS.map(
    (g) => `          <tr class="group">
            <th colspan="4" scope="colgroup">${esc(t(g.group))}</th>
          </tr>
${g.rows
  .map(
    (r) => `          <tr>
            <th scope="row"><code>${esc(r.name)}</code></th>
            <td class="col-mark">${tick(r.read, label)}</td>
            <td class="col-mark">${tick(r.write, label)}</td>
            <td class="col-note">${esc(t(r.note))}</td>
          </tr>`
  )
  .join("\n")}`
  ).join("\n");

  const faqItems = FAQ_NS.map(
    (n) => `        <details${n === 1 ? " open" : ""}>
          <summary>${esc(t(`faq.${n}.q`))}</summary>
          <div class="answer">${esc(t(`faq.${n}.a`))}</div>
        </details>`
  ).join("\n");

  const steps = [1, 2, 3]
    .map(
      (n) => `          <li>
            <h3>${esc(t(`how.${n}.title`))}</h3>
            <p>${esc(t(`how.${n}.body`))}</p>
          </li>`
    )
    .join("\n");

  const notSupported = [1, 2, 3, 4, 5]
    .map((n) => `            <li>${esc(t(`formats.not.${n}`))}</li>`)
    .join("\n");

  const langLinks = buildable
    .map((l) => {
      const href = l.path ? `${cfg.domain}/${l.path}/` : `${cfg.domain}/`;
      const current = l.code === code ? ` aria-current="true"` : "";
      return `            <li><a href="${href}" hreflang="${l.code}" lang="${l.code}"${current}>${esc(l.native)}</a></li>`;
    })
    .join("\n");

  /* lukko and -tta are Finnish and stay Finnish in all thirty-seven languages,
     so the sentence carries placeholders and the page fills them in. */
  const nameProse = esc(t("name.body"))
    .replace("{lukko}", '<i lang="fi">lukko</i>')
    .replace("{tta}", '<i lang="fi">-tta</i>');

  /* The author's name is a link, so the string keeps its {author} placeholder
     until here rather than being flattened into text by the build. */
  const copyright = esc(t("footer.copyright")).split("{author}");
  const authorLink = `<a href="${cfg.authorUrl}">${esc(cfg.authorName)}</a>`;

  const sunIcon = `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="3.1" stroke="currentColor" stroke-width="1.5"/><path d="M8 1v1.6M8 13.4V15M15 8h-1.6M2.6 8H1m11-5-1.1 1.1M5.1 10.9 4 12m8 0-1.1-1.1M5.1 5.1 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  const moonIcon = `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13.5 9.6A5.9 5.9 0 0 1 6.4 2.5a5.9 5.9 0 1 0 7.1 7.1Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
  const globeIcon = `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6.2" stroke="currentColor" stroke-width="1.4"/><path d="M1.8 8h12.4M8 1.8c1.7 1.8 2.6 3.9 2.6 6.2S9.7 12.4 8 14.2C6.3 12.4 5.4 10.3 5.4 8s.9-4.4 2.6-6.2Z" stroke="currentColor" stroke-width="1.4"/></svg>`;
  const arrow = `<svg class="arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  /* -------------------------------------------------------------- html -- */

  return `<!doctype html>
<html lang="${code}" dir="${dir}" id="top">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

  <title>${esc(t("meta.title"))}</title>
  <meta name="description" content="${esc(t("meta.description"))}">
  <link rel="canonical" href="${canonical}">
  <meta name="theme-color" content="#FBF8F2" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#15161A" media="(prefers-color-scheme: dark)">
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

  <script>
    (function () {
      try {
        var c = localStorage.getItem("lukotta-theme");
        var d = c === "dark" || (c !== "light" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
        document.documentElement.setAttribute("data-theme", d ? "dark" : "light");
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
      <a class="brand" href="#top" aria-label="${esc(t("ui.toTop"))}">
        <picture>
          <source data-theme-source srcset="${A("brand/lukotta-mark-dark.png")}" media="(prefers-color-scheme: dark)">
          <img src="${A("brand/lukotta-mark-light.png")}" alt="" width="22" height="22" decoding="async">
        </picture>
        <span>Lukotta</span>
      </a>

      <nav class="site-nav" aria-label="${esc(t("ui.menu"))}">
        <a href="${cfg.downloadUrl}">${esc(t("nav.download"))}</a>
        <a href="#features">${esc(t("nav.features"))}</a>
        <a href="#how">${esc(t("nav.how"))}</a>
      </nav>

      <div class="header-tools">
        <button type="button" class="theme-switch" role="switch" aria-checked="false" data-toggle-theme
                data-label-light="${esc(t("ui.switchToLight"))}"
                data-label-dark="${esc(t("ui.switchToDark"))}">
          <span class="track" aria-hidden="true">
            <span class="ico ico-sun">${sunIcon}</span>
            <span class="ico ico-moon">${moonIcon}</span>
            <span class="knob"></span>
          </span>
        </button>

        <details class="lang">
          <summary aria-label="${esc(t("ui.chooseLanguage"))}">${globeIcon}<span>${esc(native)}</span></summary>
          <div class="lang-panel">
            <ul class="lang-list">
${langLinks}
            </ul>
          </div>
        </details>
      </div>
    </div>
  </header>

  <main id="main">

    <section class="hero">
      <div class="wrap">
        <div class="hero-text">
          <h1>${esc(t("hero.title"))}</h1>
          <p class="lead">${esc(t("hero.subtitle"))}</p>
          <p class="hero-actions">
            <a class="btn" href="${cfg.downloadUrl}">${esc(t("hero.download"))}${arrow}</a>
            <a class="plain" href="${cfg.githubRepo}">${esc(t("hero.source"))}</a>
          </p>
          <p class="spec">${esc(t("hero.meta"))}</p>
        </div>

        <figure class="shot" style="max-width:${Math.min(880, shotSize.width)}px">
          <div class="shot-bar" aria-hidden="true">
            <i class="close"></i><i class="minimise"></i><i class="zoom"></i>
          </div>
          <picture>
            <source data-theme-source srcset="${shot("dark")}" media="(prefers-color-scheme: dark)">
            <img src="${shot("light")}" alt="${esc(t("hero.screenshotAlt"))}" width="${shotSize.width}" height="${shotSize.height}" fetchpriority="high" decoding="async">
          </picture>
        </figure>
      </div>
    </section>

    <section id="how" class="rule">
      <div class="wrap">
        <div class="section-head">
          <h2>${esc(t("how.title"))}</h2>
        </div>
        <p class="prose"><span class="lead-in">${esc(t("how.lead"))}</span></p>

        <ol class="steps">
${steps}
        </ol>

        <p class="note">${esc(t("how.note"))}</p>
      </div>
    </section>

    <section id="features" class="rule">
      <div class="wrap">
        <div class="section-head">
          <h2>${esc(t("features.title"))}</h2>
        </div>
        <div class="prose">
          <p class="lead-in">${esc(t("features.lead"))}</p>
          <p>${esc(t("features.body"))}</p>
          <p>${esc(t("features.body2"))}</p>
        </div>

        <h3 class="sub">${esc(t("formats.title"))}</h3>

        <div class="table-scroll">
          <table class="formats">
            <thead>
              <tr>
                <th scope="col">${esc(t("formats.col.format"))}</th>
                <th scope="col" class="col-mark">${esc(t("formats.col.read"))}</th>
                <th scope="col" class="col-mark">${esc(t("formats.col.write"))}</th>
                <th scope="col" class="col-note">${esc(t("formats.col.notes"))}</th>
              </tr>
            </thead>
            <tbody>
${tableRows}
            </tbody>
          </table>
        </div>

        <p class="after-table">
          <a class="plain" href="${cfg.githubRepo}/blob/main/SPECS.md">${esc(t("formats.specs"))}${arrow}</a>
        </p>

        <div class="aside">
          <h3>${esc(t("formats.not.title"))}</h3>
          <ul class="bullets">
${notSupported}
          </ul>
        </div>
      </div>
    </section>

    <section id="name" class="rule">
      <div class="wrap">
        <div class="section-head">
          <h2>${esc(t("name.title"))}</h2>
        </div>
        <div class="prose">
          <p>${nameProse}</p>
        </div>
      </div>
    </section>

    <section id="faq" class="rule">
      <div class="wrap">
        <div class="section-head">
          <h2>${esc(t("faq.title"))}</h2>
        </div>
        <div class="faq">
${faqItems}
        </div>
      </div>
    </section>

  </main>

  <footer class="site-footer">
    <div class="wrap">
      <nav aria-label="${esc(t("ui.menu"))}">
        <a href="${cfg.githubRepo}/blob/main/PRIVACY.md">${esc(t("footer.privacy"))}</a>
        <a href="${cfg.githubRepo}/blob/main/LICENSE.txt">${esc(t("footer.licence"))}</a>
        <a href="mailto:${cfg.supportEmail}">${esc(t("footer.contact"))}</a>
      </nav>
      <p class="colophon">
        <span>${copyright.join(authorLink)}</span>
        <span>${esc(t("footer.gpl"))}</span>
      </p>
    </div>
  </footer>

  <script>
    /* Which languages have a finished page, and every region code each one
       serves: es-419 and es-MX are Spanish readers in Latin America, and they
       should land on the Spanish page rather than the English one. Written by
       the build so the matcher can never disagree with what was published. */
    window.LUKOTTA_LANGS = ${JSON.stringify(
      indexable.map((l) => ({ c: l.code, p: l.path, s: l.alsoServes || [] }))
    )};
    window.LUKOTTA_LANG = ${JSON.stringify(code)};
  </script>
  <script src="${assetPrefix}script.js" defer></script>
</body>
</html>
`;
}
