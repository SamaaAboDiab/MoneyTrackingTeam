import { flushSync } from "react-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { saveLocale } from "../../store/slices/authSlice";

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  const changeLanguage = (lng) => {
    if (i18n.language !== lng) {
      // Cross-fade old and new language (text + direction) instead of an abrupt jump.
      // flushSync makes React render the new language inside the transition callback.
      const apply = () => flushSync(() => i18n.changeLanguage(lng));
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (document.startViewTransition && !reduceMotion) document.startViewTransition(apply);
      else apply();
      // يتزامن مع حساب المستخدم عشان يفضل نفس اللغة على أي جهاز يسجّل دخول منه.
      if (token) dispatch(saveLocale(lng));
    }
  };

  const baseBtn =
    "rounded-lg px-3.5 py-2 text-xs font-bold transition-colors sm:px-3 sm:py-1.5";

  return (
    <div className="inline-flex gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1">
      <button
        type="button"
        onClick={() => changeLanguage("ar")}
        className={`${baseBtn} ${
          i18n.language === "ar"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        AR
      </button>
      <button
        type="button"
        onClick={() => changeLanguage("en")}
        className={`${baseBtn} ${
          i18n.language === "en"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        EN
      </button>
    </div>
  );
}

export default LanguageSwitcher;
