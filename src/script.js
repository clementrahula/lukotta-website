/* Lukotta — lukotta.com
   Three jobs: remember the appearance choice, keep the screenshot in step with
   it, and close the language menu when the reader clicks away. Everything else
   on the page is plain HTML and works with this file absent. */

(function () {
  "use strict";

  /* Two appearances, light and dark. Until the reader picks one, the page
     follows whatever their machine is set to; picking one stores it and stops
     the page following along. */
  var KEY = "lukotta-theme";           /* "light" | "dark", or absent */
  var root = document.documentElement;
  var mql = window.matchMedia("(prefers-color-scheme: dark)");

  function stored() {
    try {
      var v = localStorage.getItem(KEY);
      return v === "light" || v === "dark" ? v : null;
    } catch (e) { return null; }
  }

  function resolve(choice) {
    return choice || (mql.matches ? "dark" : "light");
  }

  /* The screenshot is a <picture> whose dark <source> carries a media query.
     Rewriting that media attribute swaps the image without a second download,
     and leaves the no-JavaScript path — plain prefers-color-scheme — intact. */
  function syncShots(resolved, choice) {
    var sources = document.querySelectorAll("source[data-theme-source]");
    for (var i = 0; i < sources.length; i++) {
      sources[i].media = choice === null
        ? "(prefers-color-scheme: dark)"
        : (resolved === "dark" ? "all" : "not all");
    }
  }

  function apply(choice) {
    var resolved = resolve(choice);
    root.setAttribute("data-theme", resolved);
    root.setAttribute("data-theme-choice", choice);
    syncShots(resolved, choice);

    /* The switch reports whether dark is on; its name says what a click does. */
    var buttons = document.querySelectorAll("[data-toggle-theme]");
    for (var i = 0; i < buttons.length; i++) {
      var label = buttons[i].getAttribute(
        resolved === "dark" ? "data-label-light" : "data-label-dark"
      );
      buttons[i].setAttribute("aria-checked", resolved === "dark" ? "true" : "false");
      buttons[i].setAttribute("aria-label", label);
      buttons[i].setAttribute("title", label);
    }
  }

  apply(stored());

  document.addEventListener("click", function (event) {
    var button = event.target.closest ? event.target.closest("[data-toggle-theme]") : null;
    if (!button) return;
    var next = resolve(stored()) === "dark" ? "light" : "dark";
    try { localStorage.setItem(KEY, next); } catch (e) { /* private browsing */ }
    apply(next);
  });

  /* Follow the machine until the reader chooses for themselves. */
  var onSystemChange = function () { if (stored() === null) apply(null); };
  if (mql.addEventListener) mql.addEventListener("change", onSystemChange);
  else if (mql.addListener) mql.addListener(onSystemChange);

  /* Language menu: <details> already opens and closes on its own. This only
     dismisses it on an outside click or Escape, which <details> does not do. */
  var menu = document.querySelector(".lang");
  if (menu) {
    document.addEventListener("click", function (event) {
      if (menu.open && !menu.contains(event.target)) menu.open = false;
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menu.open) {
        menu.open = false;
        var summary = menu.querySelector("summary");
        if (summary) summary.focus();
      }
    });
  }

  /* Hairline under the header, once the page has moved. */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.setAttribute("data-scrolled", window.scrollY > 4 ? "true" : "false");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ------------------------------------------------------- language ----- */

  /* Send a first-time visitor to the page in their own language.
     Three rules keep this from doing harm:

     1. Only from the root. Someone who asked for /de/ gets /de/, and a reader
        who has chosen a language from the menu is never moved again.
     2. Only once. The choice is remembered, so a reader who came here in one
        language and went back to English stays in English.
     3. Only to a finished translation. window.LUKOTTA_LANGS holds the
        languages that were actually published, so this can never send anyone
        to a page that does not exist.

     It matches regions properly: es-MX and es-419 are Spanish readers in Latin
     America and there is one Spanish page, so they get it. A bare tag matches
     a regional page too — pt and pt-BR match pt-PT — but only after every exact
     and declared match has been tried.

     A script subtag is not a region and is never matched loosely. zh-Hans is
     Simplified Chinese; zh-TW and zh-HK are Traditional, and a reader of one
     cannot read the other comfortably, so they are left on English rather than
     handed the wrong script. pt-PT carries a region, PT, so pt-BR may fall back
     to it; zh-Hans carries a script, Hans, so zh-TW may not. */

  var LANG_KEY = "lukotta-lang";

  function pathFor(code) {
    var langs = window.LUKOTTA_LANGS || [];
    var want = String(code).toLowerCase();
    var base = want.split("-")[0];
    var i, l;

    /* An exact tag, or a region the language declares it serves. */
    for (i = 0; i < langs.length; i++) {
      l = langs[i];
      if (l.c.toLowerCase() === want) return l.p;
      for (var j = 0; j < l.s.length; j++) {
        if (String(l.s[j]).toLowerCase() === want) return l.p;
      }
    }
    /* Failing that, the same language whatever the region — but only where the
       page is identified by a region. A four-letter subtag is a script, and a
       script is not something to guess at. */
    for (i = 0; i < langs.length; i++) {
      l = langs[i];
      var parts = l.c.split("-");
      var hasScript = parts.length > 1 && parts[1].length === 4;
      if (hasScript) continue;
      if (parts[0].toLowerCase() === base) return l.p;
    }
    return null;
  }

  function chooseLanguage() {
    var here = window.LUKOTTA_LANG;
    var langs = window.LUKOTTA_LANGS || [];
    if (!langs.length) return;

    /* Rule 1: the root only. */
    var path = location.pathname.replace(/\/+$/, "");
    if (path !== "" && path !== "/index.html") return;

    /* Rule 2: never override a reader who has already chosen. */
    var chosen = null;
    try { chosen = localStorage.getItem(LANG_KEY); } catch (e) {}
    if (chosen) return;

    var wanted = navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language];

    for (var i = 0; i < wanted.length; i++) {
      if (!wanted[i]) continue;
      var target = pathFor(wanted[i]);
      if (target === null) continue;
      if (target === "" || target === undefined) return;   /* already English */
      if (String(wanted[i]).toLowerCase().split("-")[0] === String(here).toLowerCase().split("-")[0]) return;
      location.replace("/" + target + "/");
      return;
    }
  }

  /* Following a language from the menu is a choice, and is remembered. */
  document.addEventListener("click", function (event) {
    var link = event.target.closest ? event.target.closest(".lang-list a") : null;
    if (!link) return;
    try { localStorage.setItem(LANG_KEY, link.getAttribute("hreflang")); } catch (e) {}
  });

  chooseLanguage();
})();
