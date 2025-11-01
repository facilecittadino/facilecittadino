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

    // Services (6) — IT, EN, HI, PA, HI-Latn
"services.caf.title": {
  it: "CAF (Centro di Assistenza Fiscale)",
  en: "CAF (Tax Assistance Center)",
  hi: "CAF (कर सहायता केंद्र)",
  pa: "CAF (ਟੈਕਸ ਸਹਾਇਤਾ ਕੇਂਦਰ)",
  "hi-Latn": "CAF (Tax Sahayata Kendra)"
},
"services.caf.desc": {
  it: "Ti aiutiamo con tutte le pratiche fiscali come dichiarazione dei redditi, ISEE, modelli 730, e altre procedure tributarie, in modo semplice e veloce.",
  en: "We help with income tax returns, ISEE, 730 forms, and other tax procedures—simply and quickly.",
  hi: "आयकर रिटर्न, ISEE, 730 फॉर्म और अन्य कर संबंधी प्रक्रियाओं में हम सरल और तेज़ मदद करते हैं।",
  pa: "ਆਮਦਨੀ ਕਰ ਰਿਟਰਨ, ISEE, 730 ਫਾਰਮ ਅਤੇ ਹੋਰ ਕਰੀ ਪ੍ਰਕਿਰਿਆਵਾਂ ਵਿੱਚ ਅਸੀਂ ਸਧਾਰੇ ਤੇ ਤੇਜ਼ ਤਰੀਕੇ ਨਾਲ ਮਦਦ ਕਰਦੇ ਹਾਂ।",
  "hi-Latn": "Income tax return, ISEE, 730 form aur anya tax processes me hum simple aur fast madad karte hain."
},

"services.patronato.title": {
  it: "Patronato",
  en: "Patronato",
  hi: "Patronato",
  pa: "Patronato",
  "hi-Latn": "Patronato"
},
"services.patronato.desc": {
  it: "Offriamo supporto per pensioni, indennità, disoccupazione e altre pratiche previdenziali o assistenziali con consulenza personalizzata.",
  en: "We offer support for pensions, allowances, unemployment, and other welfare procedures with personalized guidance.",
  hi: "पेंशन, भत्ते, बेरोज़गारी और अन्य सामाजिक/प्रावधान संबंधी कार्यों में व्यक्तिगत मार्गदर्शन के साथ सहायता।",
  pa: "ਪੈਂਸ਼ਨ, ਭੱਤੇ, ਬੇਰੁਜ਼ਗਾਰੀ ਅਤੇ ਹੋਰ ਭਲਾਈ ਪ੍ਰਕਿਰਿਆਵਾਂ ਲਈ ਨਿੱਜੀ ਸਲਾਹ ਨਾਲ ਸਹਾਇਤਾ।",
  "hi-Latn": "Pension, bhatte, berozgaari aur anya samajik/pravidhan prakriyaon me personal guidance ke saath sahayata."
},

"services.legal.title": {
  it: "Assistenza Legale / Supporto",
  en: "Legal Assistance / Support",
  hi: "कानूनी सहायता / सपोर्ट",
  pa: "ਕਾਨੂੰਨੀ ਸਹਾਇਤਾ / ਸਮਰਥਨ",
  "hi-Latn": "Kanooni Sahayata / Support"
},
"services.legal.desc": {
  it: "Un aiuto legale chiaro e accessibile per contratti, documenti, vertenze o problemi legati ai diritti del lavoro e civili.",
  en: "Clear, accessible legal help for contracts, documents, disputes, or issues related to labor and civil rights.",
  hi: "कॉन्ट्रैक्ट, दस्तावेज़, विवाद या श्रम व नागरिक अधिकारों से जुड़े मुद्दों पर स्पष्ट और सुलभ कानूनी मदद।",
  pa: "ਕਾਂਟ੍ਰੈਕਟ, ਦਸਤਾਵੇਜ਼, ਵਿਵਾਦ ਜਾਂ ਮਜ਼ਦੂਰੀ ਅਤੇ ਨਾਗਰਿਕ ਹੱਕਾਂ ਨਾਲ ਜੁੜੇ ਮਸਲਿਆਂ ਲਈ ਸਪਸ਼ਟ ਤੇ ਸੌਖੀ ਕਾਨੂੰਨੀ ਮਦਦ।",
  "hi-Latn": "Contract, documents, vivad ya labour/civil rights se jude muddon par saaf aur accessible legal help."
},

"services.corsi.title": {
  it: "Corsi di Formazione",
  en: "Training Courses",
  hi: "प्रशिक्षण कोर्स",
  pa: "ਟ੍ਰੇਨਿੰਗ ਕੋਰਸ",
  "hi-Latn": "Training Courses"
},
"services.corsi.desc": {
  it: "Corsi professionali e aggiornamenti formativi per migliorare le competenze e trovare nuove opportunità di lavoro.",
  en: "Professional courses and upskilling to improve skills and find new job opportunities.",
  hi: "कौशल बढ़ाने और नई नौकरी के अवसर पाने के लिए व्यावसायिक कोर्स और अपस्किलिंग।",
  pa: "ਕੁਸ਼ਲਤਾਵਾਂ ਵਧਾਉਣ ਅਤੇ ਨਵੀਆਂ ਨੌਕਰੀ ਦੇ ਮੌਕਿਆਂ ਲਈ ਪੇਸ਼ਾਵਰ ਕੋਰਸ ਅਤੇ ਅੱਪਸਕਿਲਿੰਗ।",
  "hi-Latn": "Professional courses aur upskilling se skills improve karo aur naye job opportunities pao."
},

"services.web.title": {
  it: "Creazione Siti Web",
  en: "Website Creation",
  hi: "वेबसाइट निर्माण",
  pa: "ਵੈੱਬਸਾਈਟ ਤਿਆਰੀ",
  "hi-Latn": "Website Creation"
},
"services.web.desc": {
  it: "Realizziamo siti web professionali e moderni per aziende, freelance o piccoli business, curando design e funzionalità.",
  en: "We build professional, modern websites for companies, freelancers, or small businesses, with care for design and functionality.",
  hi: "कंपनियों, फ्रीलांसरों और छोटे व्यवसायों के लिए आधुनिक, पेशेवर वेबसाइट—डिज़ाइन और फ़ंक्शन पर विशेष ध्यान।",
  pa: "ਕੰਪਨੀਆਂ, ਫ੍ਰੀਲਾਂਸਰਾਂ ਅਤੇ ਛੋਟੇ ਕਾਰੋਬਾਰ ਲਈ ਆਧੁਨਿਕ, ਪੇਸ਼ਾਵਰ ਵੈੱਬਸਾਈਟ—ਡਿਜ਼ਾਈਨ ਅਤੇ ਫਂਕਸ਼ਨ 'ਤੇ ਖਾਸ ਧਿਆਨ।",
  "hi-Latn": "Companies, freelancers aur small business ke liye modern, professional websites—design aur function par khas dhyan."
},

"services.biglietti.title": {
  it: "Biglietti & E-Visa Supporto",
  en: "Tickets & E-Visa Support",
  hi: "टिकट और ई-वीज़ा सहायता",
  pa: "ਟਿਕਟਾਂ ਅਤੇ E-Visa ਸਹਾਇਤਾ",
  "hi-Latn": "Tickets & E-Visa Support"
},
"services.biglietti.desc": {
  it: "Prenotazioni per treni, autobus e aerei. Aiuto anche per ottenere eVisa per chi viaggia all’estero in modo rapido e sicuro.",
  en: "Bookings for trains, buses, and flights. We also help obtain eVisas for international travel quickly and safely.",
  hi: "ट्रेन, बस और उड़ान की बुकिंग। विदेश यात्रा के लिए eVisa प्राप्त करने में भी तेज़ और सुरक्षित मदद।",
  pa: "ਰੇਲ, ਬੱਸ ਅਤੇ ਉਡਾਣਾਂ ਦੀ ਬੁਕਿੰਗ। ਵਿਦੇਸ਼ ਯਾਤਰਾ ਲਈ eVisa ਲੈਣ ਵਿੱਚ ਵੀ ਤੇਜ਼ ਅਤੇ ਸੁਰੱਖਿਅਤ ਮਦਦ।",
  "hi-Latn": "Train, bus aur flight ki booking. Abroad travel ke liye eVisa hasil karne me bhi tez aur surakshit madad."
}
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