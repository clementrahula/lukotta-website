/* Behaviour for lukotta.com: the appearance choice and the screenshot that
   follows it, the language menu, the language chooser, and the platform
   notice. Everything else on the page is plain HTML and works without this
   file. */

(function () {
  "use strict";

  /* Light and dark. With no stored choice the page follows the system
     setting; choosing stores it and stops following. */
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
     Rewriting that attribute swaps the image without a second download and
     leaves the no-JavaScript path, plain prefers-color-scheme, intact. */
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

    /* aria-checked reports whether dark is on; the label states what a click
       will do. */
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
    try { localStorage.setItem(KEY, next); } catch (e) { /* storage unavailable */ }
    apply(next);
  });

  /* Follow the system setting until a choice is stored. */
  var onSystemChange = function () { if (stored() === null) apply(null); };
  if (mql.addEventListener) mql.addEventListener("change", onSystemChange);
  else if (mql.addListener) mql.addListener(onSystemChange);

  /* <details> opens and closes itself. This adds dismissal on an outside
     click and on Escape, which it does not do. */
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

  /* Hairline under the header once the page has scrolled. */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.setAttribute("data-scrolled", window.scrollY > 4 ? "true" : "false");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ------------------------------------------------------- language ----- */

  /* Sends a first-time visitor to the page in their own language, under three
     constraints:

     1. Root only. A request for /de/ is left alone.
     2. Once. An explicit choice from the menu is stored and then honoured.
     3. Published languages only. window.LUKOTTA_LANGS is emitted by the build.

     Region codes resolve through alsoServes, so es-MX and es-419 reach the
     Spanish page. A bare tag may also match a regional page, pt to pt-PT, but
     only after exact and declared matches have been tried.

     A script subtag is never matched loosely. zh-Hans is Simplified; zh-TW and
     zh-HK are Traditional and are left on English rather than served the wrong
     script. pt-PT carries a region, so pt-BR may fall back to it; zh-Hans
     carries a script, so zh-TW may not. */

  var LANG_KEY = "lukotta-lang";

  function pathFor(code) {
    var langs = window.LUKOTTA_LANGS || [];
    var want = String(code).toLowerCase();
    var base = want.split("-")[0];
    var i, l;

    /* An exact tag, or a region the language declares in alsoServes. */
    for (i = 0; i < langs.length; i++) {
      l = langs[i];
      if (l.c.toLowerCase() === want) return l.p;
      for (var j = 0; j < l.s.length; j++) {
        if (String(l.s[j]).toLowerCase() === want) return l.p;
      }
    }
    /* Otherwise the same language in any region, but only where the page is
       identified by a region. A four-letter subtag is a script, not a region. */
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

  /* A language followed from the menu is an explicit choice; store it. */
  document.addEventListener("click", function (event) {
    var link = event.target.closest ? event.target.closest(".lang-list a") : null;
    if (!link) return;
    try { localStorage.setItem(LANG_KEY, link.getAttribute("hreflang")); } catch (e) {}
  });

  chooseLanguage();

  /* ------------------------------------------------ platform notice ----- */

  /* Lukotta runs on macOS only. Pressing Download elsewhere opens a dialog
     stating that, then allows the download regardless. Nothing is blocked.

     Without JavaScript this never runs and the link behaves as a plain link. */

  function whichPlatform() {
    var ua = navigator.userAgent || "";
    var plat = (navigator.userAgentData && navigator.userAgentData.platform) ||
               navigator.platform || "";

    /* iPadOS reports itself as a Mac. maxTouchPoints distinguishes them: a
       Mac reports none, even with a trackpad. */
    var iPadPretendingToBeAMac = /Mac/i.test(plat) && navigator.maxTouchPoints > 1;

    if (/iPhone|iPod|iPad/i.test(ua) || iPadPretendingToBeAMac) return { mobile: true };
    if (/Android/i.test(ua)) return { mobile: true };
    if (/Mac/i.test(plat) || /Mac OS X/i.test(ua)) return { mac: true };
    if (/Win/i.test(plat) || /Windows/i.test(ua)) return { system: "Windows" };
    if (/CrOS/i.test(ua)) return { system: "ChromeOS" };
    /* Android also reports Linux, so it must be tested before this. */
    if (/Linux|X11/i.test(plat) || /Linux/i.test(ua)) return { system: "Linux" };
    return { system: null };
  }

  var DOWNLOAD_URL = window.LUKOTTA_DOWNLOAD;
  var notice = document.getElementById("platform-notice");

  if (notice && typeof notice.showModal === "function") {
    var where = whichPlatform();

    if (!where.mac) {
      var body = notice.querySelector(".notice-body");
      var hint = notice.querySelector(".notice-hint");
      var shareButton = notice.querySelector("[data-notice-share]");
      var copyButton = notice.querySelector("[data-notice-copy]");
      var canShare = typeof navigator.share === "function";
      var canCopy = !!(navigator.clipboard && navigator.clipboard.writeText);

      if (where.mobile) {
        body.textContent = body.getAttribute("data-mobile");
        if (canShare) {
          hint.textContent = hint.getAttribute("data-share");
          shareButton.hidden = false;
        } else if (canCopy) {
          hint.textContent = hint.getAttribute("data-copy");
          copyButton.hidden = false;
        }
      } else {
        var name = where.system || body.getAttribute("data-unknown-system");
        body.textContent = body.getAttribute("data-desktop").replace("{system}", name);
      }

      var pending = null;

      document.addEventListener("click", function (event) {
        var link = event.target.closest ? event.target.closest("a[href]") : null;
        if (!link) return;
        if (link.href !== DOWNLOAD_URL) return;
        event.preventDefault();
        pending = link.href;
        notice.showModal();
      });

      notice.querySelector("[data-notice-cancel]").addEventListener("click", function () {
        notice.close();
      });

      notice.querySelector("[data-notice-download]").addEventListener("click", function () {
        notice.close();
        if (pending) window.location.href = pending;
      });

      if (shareButton) {
        shareButton.addEventListener("click", function () {
          navigator.share({ url: location.href, title: document.title })
            .catch(function () { /* sheet dismissed */ });
        });
      }

      if (copyButton) {
        copyButton.addEventListener("click", function () {
          navigator.clipboard.writeText(location.href).then(function () {
            copyButton.textContent = copyButton.getAttribute("data-copied");
            setTimeout(function () {
              copyButton.textContent = copyButton.getAttribute("data-label");
            }, 2000);
          }).catch(function () {});
        });
      }
    }
  }

})();
