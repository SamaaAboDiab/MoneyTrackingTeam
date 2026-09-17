import { useTranslation } from "react-i18next";
import { changeLanguageSmoothly } from "../../i18n/i18n";

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    changeLanguageSmoothly(lng);
  };

  const baseBtn =
    "px-3 py-1.5 text-xs font-bold transition-colors";

  return (
    <div className="inline-flex overflow-hidden rounded-lg border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => changeLanguage("ar")}
        className={`${baseBtn} ${
          i18n.language === "ar"
            ? "bg-brand-600 text-white"
            : "text-slate-600 hover:bg-slate-50"
        }`}
      >
        AR
      </button>
      <button
        type="button"
        onClick={() => changeLanguage("en")}
        className={`${baseBtn} ${
          i18n.language === "en"
            ? "bg-brand-600 text-white"
            : "text-slate-600 hover:bg-slate-50"
        }`}
      >
        EN
      </button>
    </div>
  );
}

export default LanguageSwitcher;
