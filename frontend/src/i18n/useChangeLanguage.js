import { useCallback } from "react";
import { flushSync } from "react-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { saveLocale } from "../store/slices/authSlice";

// Switches the UI language (shared by LanguageSwitcher and Settings → Preferences).
export default function useChangeLanguage() {
  const { i18n } = useTranslation();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  return useCallback(
    (lng) => {
      if (i18n.language === lng) return;
      // Cross-fade old and new language (text + direction) instead of an abrupt jump.
      // flushSync makes React render the new language inside the transition callback.
      const apply = () => flushSync(() => i18n.changeLanguage(lng));
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (document.startViewTransition && !reduceMotion) document.startViewTransition(apply);
      else apply();
      // يتزامن مع حساب المستخدم عشان يفضل نفس اللغة على أي جهاز يسجّل دخول منه.
      if (token) dispatch(saveLocale(lng));
    },
    [i18n, dispatch, token]
  );
}
