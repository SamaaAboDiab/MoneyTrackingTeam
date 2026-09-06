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

export default i18n;
