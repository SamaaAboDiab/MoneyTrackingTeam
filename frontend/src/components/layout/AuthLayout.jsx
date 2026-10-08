import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Wallet } from "lucide-react";
import LanguageSwitcher from "../common/LanguageSwitcher";
import authBg from "../../assets/auth-bg.jpg";

function Brand() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white">
        <Wallet size={18} strokeWidth={2.25} />
      </span>
      <span className="text-base font-extrabold text-white">{t("layout.brand")}</span>
    </div>
  );
}

function AuthLayout() {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const isArabic = i18n.language === "ar";
  const photo = `bg-cover bg-center ${isArabic ? "" : "transform-[scaleX(-1)]"}`;

  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-x-clip bg-navy-900">
      {/* الصورة خلفية للصفحة كلها */}
      <div aria-hidden="true" className={`fixed inset-0 -z-20 ${photo}`} style={{ backgroundImage: `url(${authBg})` }} />
      <div aria-hidden="true" className="fixed inset-0 -z-10 bg-navy-900/65" />

      <header className="flex items-center px-4 pt-4 sm:px-6 sm:pt-6">
        <Brand />
      </header>

      {/* الفورم على اليمين في الإنجليزي وعلى الشمال في العربي، والنص في الناحية التانية */}
      <main
        dir={isArabic ? "rtl" : "ltr"}
        className="flex flex-1 items-center justify-center gap-10 px-4 py-6 sm:px-6 sm:py-10 lg:px-16"
      >
        <div className="hidden flex-1 md:flex">
          <div className="auth-panel-content flex max-w-md flex-col items-start text-start text-white">
            <h2 className="space-y-1 text-3xl font-extrabold leading-tight lg:text-4xl">
              <span className="block">{t("auth.panel.headline1")}</span>
              <span className="block">{t("auth.panel.headline2")}</span>
              <span className="block">{t("auth.panel.headline3")}</span>
            </h2>
            <p className="mt-6 max-w-[38ch] text-sm leading-7 text-white/80 lg:text-base">{t("auth.panel.subtitle")}</p>
          </div>
        </div>

        <div
          key={pathname}
          className="auth-panel-content w-full max-w-md shrink-0 rounded-3xl bg-white px-6 py-8 shadow-2xl sm:px-8 sm:py-10"
        >
          <div className="mb-5 flex justify-end">
            <LanguageSwitcher />
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AuthLayout;
