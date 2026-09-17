import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ar from "./locales/ar.json";
import en from "./locales/en.json";

export const LANGUAGE_STORAGE_KEY = "appLanguage";

const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
const initialLanguage = savedLanguage === "en" ? "en" : "ar";

function applyDirection(lang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
}

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: initialLanguage,
  fallbackLng: "ar",
  interpolation: {
    escapeValue: false,
  },
});

applyDirection(initialLanguage);

i18n.on("languageChanged", (lang) => {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  applyDirection(lang);
});

const FALLBACK_FADE_MS = 200;

// Cross-fades the RTL/LTR + text swap instead of an instant jump; falls back to a manual opacity fade where View Transitions isn't supported.
export function changeLanguageSmoothly(lang) {
  if (lang === i18n.language) return;

  if (typeof document.startViewTransition === "function") {
    document.startViewTransition(() => i18n.changeLanguage(lang));
    return;
  }

  const root = document.documentElement;
  root.classList.add("lang-fade-out");
  window.setTimeout(() => {
    i18n.changeLanguage(lang);
    root.classList.remove("lang-fade-out");
    root.classList.add("lang-fade-in");
    window.setTimeout(() => root.classList.remove("lang-fade-in"), FALLBACK_FADE_MS);
  }, FALLBACK_FADE_MS);
}

export default i18n;
