// js/footer.js — maps chooser, back-to-top, mobile footer cards (snap) + lightweight night tint
(function () {
  "use strict";

  // ----- Config -----
  const EXPIRY_MS = (window.APP_CONFIG?.EXPIRY_MS) ?? (60 * 60 * 1000);
  const MAPS_KEY  = "apll.maps.pref";   // {v:"google"|"apple", exp:number}
  const MQ_MOBILE = window.matchMedia("(max-width:600px)");

  // ----- Storage with expiry -----
  function getWithExpiry(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw || raw[0] !== "{") return null;
      const obj = JSON.parse(raw);
      if (!obj || typeof obj.exp !== "number" || Date.now() > obj.exp) {
        localStorage.removeItem(key);
        return null;
      }
      return obj.v;
    } catch { return null; }
  }
  function setWithExpiry(key, val, ttl = EXPIRY_MS) {
    try { localStorage.setItem(key, JSON.stringify({ v: val, exp: Date.now() + ttl })); } catch {}
  }

  // ----- Helpers -----
  const $  = (q, r = document) => r.querySelector(q);
  const $$ = (q, r = document) => Array.from(r.querySelectorAll(q));
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  function absURL(url) {
    try { return new URL(url, location.href).href; } catch { return url || location.href; }
  }
  function openInNewTab(href) {
    if (!href) return;
    window.open(absURL(href), "_blank", "noopener");
  }
  function buildAppleURL() {
    const txt = $(".footer-address-text")?.textContent?.trim();
    if (!txt) return null;
    return `https://maps.apple.com/?q=${encodeURIComponent(txt)}`;
  }

  // ==============================
  // Maps chooser dialog
  // ==============================
  let lastActive = null;
  function openDialog(trigger) {
    const dialog   = $("#footerMapsDialog");
    if (!dialog) return;

    const googleHref = trigger.getAttribute("data-map-google") || "";
    const appleHref  = trigger.getAttribute("data-map-apple")  || buildAppleURL() || "";

    let aGoogle = $(".footer-open-google", dialog);
    let aApple  = $(".footer-open-apple", dialog);
    const chk   = $("#footerMapsRemember", dialog);
    const btnX  = $(".footer-maps-close", dialog);

    aGoogle?.setAttribute("href", googleHref);
    aApple?.setAttribute("href", appleHref);

    dialog.hidden = false;
    document.body.classList.add("overlay-lock");
    lastActive = document.activeElement;

    const primary = isIOS ? aApple : aGoogle;
    primary?.focus?.({ preventScroll: true });

    function onBackdrop(e) { if (e.target === dialog) closeDialog(); }
    function onKey(e) {
      if (e.key === "Escape") { e.preventDefault(); closeDialog(); return; }
      if (e.key !== "Tab") return;
      const f = $$("a[href],button,input,[tabindex]:not([tabindex='-1'])", dialog)
        .filter(el => !el.hasAttribute("disabled") && el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    function rememberAndOpen(kind) {
      const href = kind === "google" ? googleHref : appleHref;
      if (chk?.checked) setWithExpiry(MAPS_KEY, kind, EXPIRY_MS);
      closeDialog();
      openInNewTab(href);
    }

    dialog.addEventListener("click", onBackdrop);
    document.addEventListener("keydown", onKey);
    btnX?.addEventListener("click", closeDialog);
    aGoogle?.addEventListener("click", (e) => { e.preventDefault(); rememberAndOpen("google"); });
    aApple?.addEventListener("click",  (e) => { e.preventDefault(); rememberAndOpen("apple");  });

    function closeDialog() {
      dialog.hidden = true;
      document.body.classList.remove("overlay-lock");
      dialog.removeEventListener("click", onBackdrop);
      document.removeEventListener("keydown", onKey);
      btnX?.removeEventListener("click", closeDialog);
      // drop handlers
      const gClone = aGoogle?.cloneNode(true); if (gClone && aGoogle?.parentNode) aGoogle.parentNode.replaceChild(gClone, aGoogle); aGoogle = gClone;
      const aClone = aApple?.cloneNode(true);  if (aClone && aApple?.parentNode)   aApple.parentNode.replaceChild(aClone, aApple);   aApple  = aClone;
      lastActive?.focus?.();
    }
  }

  function onMapChooserClick(e) {
    const btn = e.target.closest("[data-map-chooser]");
    if (!btn) return;
    e.preventDefault();

    const pref = getWithExpiry(MAPS_KEY);
    const g = btn.getAttribute("data-map-google");
    const a = btn.getAttribute("data-map-apple") || buildAppleURL();
    if (pref === "google" && g) { openInNewTab(g); return; }
    if (pref === "apple"  && a) { openInNewTab(a); return; }

    openDialog(btn);
  }

  // ==============================
  // Back to top
  // ==============================
  function onBackToTop(e) {
    const link = e.target.closest(".footer-top");
    if (!link) return;
    e.preventDefault();
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduce) { window.scrollTo(0, 0); return; }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ==============================
  // Mobile footer cards (snap + light xfade)
  // ==============================
  let activeCard = null;
  let cardObserver = null;

  function enableMobileCards() {
    const cards = $$(".site-footer .footer-col");
    if (!cards.length) return;

    setActive(cards[0], null);

    // Only opacity for smoothness; transforms can jank low-end devices
    cardObserver = new IntersectionObserver((entries) => {
      let best = null, max = 0;
      for (const en of entries) {
        if (en.isIntersecting && en.intersectionRatio > max) { max = en.intersectionRatio; best = en.target; }
      }
      if (best) setActive(best, activeCard);
    }, { threshold: [0.5, 0.75, 0.9] });

    cards.forEach(c => cardObserver.observe(c));
  }

  function disableMobileCards() {
    const cards = $$(".site-footer .footer-col");
    cards.forEach(c => c.classList.remove("is-active", "is-exiting"));
    if (cardObserver) { cardObserver.disconnect(); cardObserver = null; }
  }

  function setActive(next, prev) {
    if (next === prev) return;
    if (prev) {
      prev.classList.remove("is-active");
      prev.classList.add("is-exiting");
      setTimeout(() => prev.classList.remove("is-exiting"), 280);
    }
    next.classList.add("is-active");
    activeCard = next;
  }

  // ==============================
  // Lightweight day→night tint (MOBILE ONLY)
  // ==============================
  let tintObserver = null;
  let themeOn = false;
  let raf = 0;

  function ensureFooterSentinel() {
    const footer = $(".site-footer");
    if (!footer) return null;
    let sent = footer.previousElementSibling;
    if (!sent || !sent.classList || !sent.classList.contains("footer-sentinel")) {
      sent = document.createElement("div");
      sent.className = "footer-sentinel";
      sent.style.cssText = "position:relative;height:1px;width:1px;margin:0;padding:0;";
      footer.parentNode?.insertBefore(sent, footer);
    }
    return sent;
  }

  function enableTint() {
    const footer = $(".site-footer");
    const sentinel = ensureFooterSentinel();
    if (!footer || !sentinel) return;

    if (tintObserver) { tintObserver.disconnect(); tintObserver = null; }

    // Mobile only
    if (!MQ_MOBILE.matches) {
      if (themeOn) { themeOn = false; document.body.removeAttribute("data-theme"); }
      return;
    }

    tintObserver = new IntersectionObserver((entries) => {
      const en = entries[0];
      const shouldOn = !!(en && en.isIntersecting);
      if (shouldOn === themeOn) return;
      themeOn = shouldOn;

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (themeOn) document.body.dataset.theme = "night";
        else document.body.removeAttribute("data-theme");
      });
    }, {
      root: null,
      rootMargin: "0px 0px -60% 0px",
      threshold: 0
    });

    tintObserver.observe(sentinel);
  }

  function handleMode() {
    if (MQ_MOBILE.matches) {
      enableMobileCards();
    } else {
      disableMobileCards();
    }
    enableTint();
  }

  // ----- Init -----
  function init() {
    document.addEventListener("click", onMapChooserClick);
    document.addEventListener("click", onBackToTop);
    handleMode();

    if (typeof MQ_MOBILE.addEventListener === "function") {
      MQ_MOBILE.addEventListener("change", handleMode);
    } else if (typeof MQ_MOBILE.addListener === "function") {
      MQ_MOBILE.addListener(handleMode);
    }

    // kick map warm-up immediately (in case helpers at bottom haven't run yet)
    try { warmMapNow(); } catch {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else { init(); }
})();

/* =========================================================
   Map warm-up (ensures early load; no scroll gating)
   ========================================================= */
function warmMapNow() {
  const f = document.getElementById("mapFrame");
  if (!f) return;
  // If dev accidentally set a real src, leave it
  const hasRealSrc = f.getAttribute("src") && f.getAttribute("src") !== "about:blank";
  const real = f.dataset?.src;
  if (!hasRealSrc && real) {
    // avoid built-in lazy deferral in some engines
    try { f.removeAttribute("loading"); } catch {}
    f.src = real;
  }
}

(function scheduleMapWarm() {
  const run = () => {
    // run now, then once more after first paints
    warmMapNow();
    setTimeout(warmMapNow, 600);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
})();