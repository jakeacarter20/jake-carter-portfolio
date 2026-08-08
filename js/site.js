(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Hero line masks play once the fonts have settled, so text never
  // reveals in a fallback face and then reflow-jumps.
  function play() { document.documentElement.classList.add("is-loaded"); }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(play);
    setTimeout(play, 1200);
  } else {
    play();
  }

  // Scroll reveals. IntersectionObserver only, never a scroll listener.
  var revealables = document.querySelectorAll(".reveal");
  if (reduced || !("IntersectionObserver" in window)) {
    revealables.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.15 });

    revealables.forEach(function (el, i) {
      var group = el.closest("[data-stagger]");
      if (group && !el.style.getPropertyValue("--d")) {
        var peers = Array.prototype.slice.call(group.querySelectorAll(".reveal"));
        el.style.setProperty("--d", peers.indexOf(el) * 70 + "ms");
      }
      io.observe(el);
    });
  }

  // Nav background swaps once a sentinel at the top leaves the viewport.
  var nav = document.querySelector(".nav");
  var sentinel = document.querySelector("[data-nav-sentinel]");
  if (nav && sentinel && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      nav.dataset.stuck = String(!entries[0].isIntersecting);
    }, { threshold: 0 }).observe(sentinel);
  }

  // Mobile menu.
  var toggle = document.querySelector(".nav__toggle");
  if (nav && toggle) {
    toggle.addEventListener("click", function () {
      var open = nav.dataset.open === "true";
      nav.dataset.open = String(!open);
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.textContent = open ? "Menu" : "Close";
    });
    nav.querySelectorAll(".nav__links a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.dataset.open = "false";
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "Menu";
      });
    });
  }

  // Project images are optional. If a file is missing the designed
  // placeholder underneath stays visible instead of a broken icon.
  document.querySelectorAll(".media > img").forEach(function (img) {
    img.addEventListener("error", function () { img.remove(); });
    if (img.complete && img.naturalWidth === 0) img.remove();
  });

  // Selected work tabs. Follows the ARIA tabs pattern: one tab in the page
  // tab order, arrow keys move between them, Home and End jump to the ends.
  var tablist = document.querySelector('.wtabs[role="tablist"]');
  if (tablist) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));

    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
    }

    tablist.addEventListener("click", function (e) {
      var tab = e.target.closest('[role="tab"]');
      if (tab) select(tab, false);
    });

    tablist.addEventListener("keydown", function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i === -1) return;
      var next = null;
      if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      else if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") next = tabs[0];
      else if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); select(next, true); }
    });
  }
})();
