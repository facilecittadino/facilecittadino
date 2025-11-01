// js/i18n.js
(function () {
  "use strict";

  const STORAGE_KEY = (window.APP_CONFIG?.STORAGE_KEYS?.LANG) || "apll.lang";
  const EXPIRY_MS   = (window.APP_CONFIG?.EXPIRY_MS) ?? (60*60*1000);

  // Public languages (welcome.js reuses)
  const LANGS = {
    it: "Italiano",
    en: "English",
    pa: "ਪੰਜਾਬੀ",
    hi: "हिन्दी",
    "hi-Latn": "Hinglish"
  };

  // ---- expiring storage ----
  function getLangFromStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    if (raw[0] !== "{") { localStorage.removeItem(STORAGE_KEY); return null; }
    try {
      const obj = JSON.parse(raw);
      if (!obj || typeof obj.v !== "string" || typeof obj.exp !== "number") {
        localStorage.removeItem(STORAGE_KEY); return null;
      }
      if (Date.now() > obj.exp) { localStorage.removeItem(STORAGE_KEY); return null; }
      return obj.v;
    } catch { localStorage.removeItem(STORAGE_KEY); return null; }
  }

  function setLangWithExpiry(lang, ttlMs = EXPIRY_MS) {
    if (!LANGS[lang]) return;
    const payload = JSON.stringify({ v: lang, exp: Date.now() + ttlMs });
    localStorage.setItem(STORAGE_KEY, payload);
    syncSelectors(lang);
  }

  // ---- dictionary ----
  const T = {
    "nav.brand":      { it:"AliPerLaLiberta", en:"AliPerLaLiberta", pa:"AliPerLaLiberta", hi:"AliPerLaLiberta", "hi-Latn":"AliPerLaLiberta" },
    "nav.home":       { it:"Home", en:"Home", pa:"ਮੁੱਖ ਸਫ਼ਾ", hi:"होम", "hi-Latn":"Home" },
    "nav.caf":        { it:"Servizi CAF", en:"CAF Services", pa:"CAF ਸੇਵਾਵਾਂ", hi:"CAF सेवाएँ", "hi-Latn":"CAF Sevayen" },
    "nav.patronato":  { it:"Patronato", en:"Patronato", pa:"Patronato", hi:"Patronato", "hi-Latn":"Patronato" },
    "nav.forms":      { it:"Modulistica", en:"Forms", pa:"ਫਾਰਮ", hi:"फ़ॉर्म", "hi-Latn":"Forms" },
    "nav.contacts":   { it:"Contatti", en:"Contacts", pa:"ਸੰਪਰਕ", hi:"संपर्क", "hi-Latn":"Contacts" },

    "drawer.close":   { it:"Chiudi menu", en:"Close menu", pa:"ਮੇਨੂ ਬੰਦ ਕਰੋ", hi:"मेन्यू बंद करें", "hi-Latn":"Menu band karein" },

    "hero.title":     { it:"CAF · Patronato · ECC", en:"CAF · Patronato · etc.", pa:"CAF · Patronato · ਆਦਿ", hi:"CAF · Patronato · आदि", "hi-Latn":"CAF · Patronato · aadi" },
    "hero.subtitle":  {
      it:"Professionale, chiaro e affidabile. Qui aggiungerai i tuoi contenuti più tardi — titoli, breve intro e azioni principali.",
      en:"Professional, clear and reliable. You’ll add your content later — headings, a short intro, and primary actions.",
      pa:"ਪੇਸ਼ਾਵਰ, ਸਾਫ਼ ਤੇ ਭਰੋਸੇਯੋਗ... (ਸਿਰਲੇਖ, ਛੋਟੀ ਜਾਣ-ਪਹਿਚਾਣ ਅਤੇ ਮੁੱਖ ਕਾਰਵਾਈਆਂ)।",
      hi:"पेशेवर, स्पष्ट और भरोसेमंद... (हेडिंग्स, छोटा परिचय और मुख्य एक्शन्स)।",
      "hi-Latn":"Professional, saaf aur bharosemand... (headings, chhota intro aur primary actions)."
    },
    "hero.cta.primary":   { it:"Avvia una richiesta", en:"Start a request", pa:"ਅਰਜ਼ੀ ਸ਼ੁਰੂ ਕਰੋ", hi:"अनुरोध शुरू करें", "hi-Latn":"Anurodh shuru karein" },
    "hero.cta.secondary": { it:"Vedi i servizi", en:"View services", pa:"ਸੇਵਾਵਾਂ ਵੇਖੋ", hi:"सेवाएँ देखें", "hi-Latn":"Sevayen dekhein" }
  };

  // ---- DOM apply ----
  function applyTranslations(root = document) {
    const lang = getLangFromStorage();
    if (!lang) return;
    root.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const txt = T[key]?.[lang] || "";
      if (txt) el.textContent = txt;
    });
    root.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      const spec = el.getAttribute("data-i18n-attr");
      if (!spec) return;
      spec.split(",").forEach((pair) => {
        const [attr, key] = pair.split(":").map(s => s.trim());
        const val = T[key]?.[lang] || "";
        if (attr && val) el.setAttribute(attr, val);
      });
    });
  }

  function wireSelectors() {
    const selects = Array.from(document.querySelectorAll("select.lang-select"));
    if (!selects.length) return;
    selects.forEach(sel => {
      if (!sel.dataset.populated) {
        Object.entries(LANGS).forEach(([value, label]) => {
          const opt = document.createElement("option");
          opt.value = value; opt.textContent = label;
          sel.appendChild(opt);
        });
        sel.dataset.populated = "true";
      }
    });
    const current = getLangFromStorage();
    if (current) syncSelectors(current);

    selects.forEach(sel => {
      sel.onchange = null;
      sel.addEventListener("change", () => {
        setLangWithExpiry(sel.value, EXPIRY_MS);
        applyTranslations(document);
      });
    });
  }

  function syncSelectors(lang) {
    document.querySelectorAll("select.lang-select").forEach(sel => { sel.value = lang; });
  }

  function init() {
    wireSelectors();
    applyTranslations(document);
  }

  window.LanguageSelector = {
    init,
    set: (l, ttl = EXPIRY_MS) => { setLangWithExpiry(l, ttl); applyTranslations(document); },
    get: () => getLangFromStorage(),
    LANGS
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();