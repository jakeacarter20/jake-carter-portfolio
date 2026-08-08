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

  // Selected work: every project is on the page, the strip just jumps to one.
  // A 1px detection line is placed just under the sticky strip via rootMargin,
  // so exactly one project crosses it at a time. Ratio-based spies pick the
  // panel that is leaving, because a tall panel entering scores a low ratio.
  var wnav = document.querySelector(".wnav");
  if (wnav && "IntersectionObserver" in window) {
    var LINE = 150;
    var links = Array.prototype.slice.call(wnav.querySelectorAll(".wnav__link"));
    var panels = Array.prototype.slice.call(document.querySelectorAll(".wpanel"));
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var observer = null;

    function setCurrent(a) {
      if (!a || a.getAttribute("aria-current") === "true") return;
      links.forEach(function (l) {
        if (l === a) l.setAttribute("aria-current", "true");
        else l.removeAttribute("aria-current");
      });
      if (wnav.scrollWidth > wnav.clientWidth) {
        var l = a.offsetLeft, r = l + a.offsetWidth;
        if (l < wnav.scrollLeft) wnav.scrollTo({ left: l - 24, behavior: "smooth" });
        else if (r > wnav.scrollLeft + wnav.clientWidth)
          wnav.scrollTo({ left: r - wnav.clientWidth + 24, behavior: "smooth" });
      }
    }

    function build() {
      if (observer) observer.disconnect();
      var bottom = Math.max(0, window.innerHeight - LINE - 1);
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) setCurrent(byId[e.target.id]);
        });
      }, { rootMargin: "-" + LINE + "px 0px -" + bottom + "px 0px", threshold: 0 });
      panels.forEach(function (p) { observer.observe(p); });
    }

    build();

    // The detection line depends on viewport height, so rebuild when it changes.
    var t;
    window.addEventListener("resize", function () {
      clearTimeout(t);
      t = setTimeout(build, 150);
    });
  }
})();
