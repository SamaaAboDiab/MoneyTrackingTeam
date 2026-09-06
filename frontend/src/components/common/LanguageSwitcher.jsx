import { useTranslation } from "react-i18next";
import "./LanguageSwitcher.css";

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    if (i18n.language !== lng) {
      i18n.changeLanguage(lng);
    }
  };

  return (
    <div className="language-switcher">
      <button
        type="button"
        className={i18n.language === "ar" ? "active" : ""}
        onClick={() => changeLanguage("ar")}
      >
        AR
      </button>
      <button
        type="button"
        className={i18n.language === "en" ? "active" : ""}
        onClick={() => changeLanguage("en")}
      >
        EN
      </button>
    </div>
  );
}

export default LanguageSwitcher;
