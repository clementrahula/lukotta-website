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
})();
