import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Wallet } from "lucide-react";
import LanguageSwitcher from "../common/LanguageSwitcher";
import authBg from "../../assets/auth-bg.jpg";

function AuthLayout() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  return (
    <div className="relative flex h-screen items-center justify-center overflow-y-auto px-4 py-10 lg:block lg:px-0">
      {/* Background photo. Mirrored only in LTR so its empty area always sits on the
          "end" side (right in English, left in Arabic) alongside the form. */}
      <div
        className={`absolute inset-0 -z-10 bg-cover bg-center ${isArabic ? "" : "transform-[scaleX(-1)]"}`}
        style={{ backgroundImage: `url(${authBg})` }}
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-brand-900/55" />

      {/* Positioning wrapper stays direction-aware (no dir override here) so it flips
          sides with the page. Only the inner text is pinned to Latin/English styling,
          so it doesn't pick up the Arabic (Cairo) font swap. */}
      <div className="absolute top-6 inset-s-6 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white">
          <Wallet size={18} strokeWidth={2.25} />
        </span>
        <span
          dir="ltr"
          className="text-base font-extrabold text-white"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Money Tracker
        </span>
      </div>

      <div className="absolute bottom-10 inset-s-10 hidden max-w-xl lg:block">
        <h2 className="text-2xl font-extrabold leading-tight text-white">
          {t("auth.panel.headline1")} {t("auth.panel.headline2")}
          <br />
          {t("auth.panel.headline3")}
        </h2>
        <p className="mt-2 text-sm text-white/70">{t("auth.panel.subtitle")}</p>
      </div>

      {/* Card: language switcher lives inside it (top corner) instead of floating over
          the photo, so it stays anchored to the form regardless of screen size. */}
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl lg:absolute lg:inset-e-[1%] lg:top-1/2 lg:w-145 lg:max-w-none lg:-translate-y-1/2">
        <div className="mb-4 flex justify-end">
          <LanguageSwitcher />
        </div>
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;
