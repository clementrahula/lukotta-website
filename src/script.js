/* Lukotta — lukotta.com
   Three jobs: remember the appearance choice, keep the screenshot in step with
   it, and close the language menu when the reader clicks away. Everything else
   on the page is plain HTML and works with this file absent. */

(function () {
  "use strict";

  var KEY = "lukotta-theme";           /* "auto" | "light" | "dark" */
  var root = document.documentElement;
  var mql = window.matchMedia("(prefers-color-scheme: dark)");

  function stored() {
    try { return localStorage.getItem(KEY) || "auto"; } catch (e) { return "auto"; }
  }

  function resolve(choice) {
    if (choice === "light" || choice === "dark") return choice;
    return mql.matches ? "dark" : "light";
  }

  /* The screenshot is a <picture> whose dark <source> carries a media query.
     Rewriting that media attribute swaps the image without a second download,
     and leaves the no-JavaScript path — plain prefers-color-scheme — intact. */
  function syncShots(resolved, choice) {
    var sources = document.querySelectorAll("source[data-theme-source]");
    for (var i = 0; i < sources.length; i++) {
      sources[i].media = choice === "auto"
        ? "(prefers-color-scheme: dark)"
        : (resolved === "dark" ? "all" : "not all");
    }
  }

  function apply(choice) {
    var resolved = resolve(choice);
    root.setAttribute("data-theme", resolved);
    root.setAttribute("data-theme-choice", choice);
    syncShots(resolved, choice);

    var buttons = document.querySelectorAll("[data-set-theme]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute(
        "aria-checked",
        buttons[i].getAttribute("data-set-theme") === choice ? "true" : "false"
      );
    }
  }

  apply(stored());

  document.addEventListener("click", function (event) {
    var button = event.target.closest ? event.target.closest("[data-set-theme]") : null;
    if (!button) return;
    var choice = button.getAttribute("data-set-theme");
    try { localStorage.setItem(KEY, choice); } catch (e) { /* private browsing */ }
    apply(choice);
  });

  /* Follow the system while the reader has not chosen for themselves. */
  var onSystemChange = function () { if (stored() === "auto") apply("auto"); };
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
