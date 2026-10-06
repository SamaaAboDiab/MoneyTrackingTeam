import { Link, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight, Wallet } from "lucide-react";
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

function WelcomePanel({ isRegister }) {
  const { t, i18n } = useTranslation();
  const photo = `bg-cover bg-center ${i18n.language === "ar" ? "" : "transform-[scaleX(-1)]"}`;
  const destination = isRegister ? "/login" : "/register";
  const title = isRegister ? t("auth.login.title") : t("auth.register.title");
  const subtitle = isRegister ? t("auth.login.subtitle") : t("auth.register.subtitle");
  const action = isRegister ? t("auth.register.loginLink") : t("auth.login.registerLink");
  const Arrow = isRegister ? ArrowLeft : ArrowRight;

  return (
    <aside className="relative order-1 isolate shrink-0 overflow-hidden rounded-2xl bg-brand-900/55 px-4 py-3 text-white backdrop-blur-[2px] sm:px-6 sm:py-7 md:absolute md:inset-y-0 md:inset-e-0 md:order-none md:z-10 md:flex md:w-[42%] md:items-center md:justify-center md:rounded-none md:bg-transparent md:px-10 md:py-12 md:backdrop-blur-none md:transition-transform md:duration-800 md:ease-[cubic-bezier(0.65,0,0.35,1)] md:motion-reduce:transition-none md:translate-x-[var(--auth-welcome-shift)]">
      <div aria-hidden="true" className={`absolute inset-0 -z-20 hidden md:block ${photo}`} style={{ backgroundImage: `url(${authBg})` }} />
      <div aria-hidden="true" className="absolute inset-0 -z-10 hidden bg-brand-900/65 md:block" />
      <div aria-hidden="true" className="absolute -end-20 -top-24 -z-10 h-64 w-64 rounded-full border border-white/10" />
      <div aria-hidden="true" className="absolute -bottom-36 -start-20 -z-10 h-80 w-80 rounded-full border border-white/10" />
      <div key={String(isRegister)} className="auth-panel-content relative z-10 max-w-md">
        <p className="mb-3 hidden text-xs font-bold uppercase tracking-[0.2em] text-white/60 sm:block">
          {t("layout.brand")}
        </p>
        <h2 className="text-lg font-extrabold leading-5 sm:text-2xl sm:leading-tight lg:text-3xl">
          {t("auth.panel.headline1")} {t("auth.panel.headline2")}
          <br />
          {t("auth.panel.headline3")}
        </h2>
        <p className="mt-1 max-w-[36ch] text-[11px] leading-4 text-white/75 sm:mt-4 sm:text-sm sm:leading-6">{t("auth.panel.subtitle")}</p>

        <div className="mt-2 hidden border-t border-white/15 pt-2 sm:block sm:mt-6 sm:pt-5">
          <h3 className="text-sm font-bold sm:text-lg">{title}</h3>
          <p className="mt-1 text-[11px] leading-4 text-white/70 sm:text-sm sm:leading-6">{subtitle}</p>
          <Link
            to={destination}
            className="mt-2 inline-flex min-h-9 items-center justify-center gap-2 rounded-full border border-white/35 bg-white/10 px-3 py-1 text-[11px] font-bold text-white transition hover:bg-white/20 focus-visible:outline-white sm:mt-5 sm:min-h-11 sm:px-5 sm:py-2 sm:text-sm"
          >
            {action}
            <Arrow size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </aside>
  );
}

function AuthLayout() {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();
  const isArabic = i18n.language === "ar";
  const isRegister = pathname === "/register";
  const hasSlider = pathname === "/login" || isRegister;
  const photo = `bg-cover bg-center ${isArabic ? "" : "transform-[scaleX(-1)]"}`;
  const sliderStyle = {
    "--auth-form-shift": isRegister ? (isArabic ? "-72.414%" : "72.414%") : "0%",
    "--auth-welcome-shift": isRegister ? (isArabic ? "138.095%" : "-138.095%") : "0%",
  };

  return (
    <div className="relative isolate min-h-dvh overflow-x-clip bg-brand-900 sm:bg-transparent">
      <div aria-hidden="true" className="fixed inset-0 -z-10 bg-cover bg-center md:hidden" style={{ backgroundImage: `url(${authBg})` }} />
      <div aria-hidden="true" className="fixed inset-0 -z-10 bg-brand-900/55 md:hidden" />
      {!hasSlider && <div aria-hidden="true" className="absolute inset-0 -z-10 hidden sm:block">
        <div className={`absolute inset-0 ${photo}`} style={{ backgroundImage: `url(${authBg})` }} />
        <div className="absolute inset-0 bg-brand-900/55" />
      </div>}

      <header className="relative z-10 flex h-16 items-start justify-between px-4 pt-3 sm:hidden">
        <Brand />
        <LanguageSwitcher />
      </header>

      <div className="absolute top-6 inset-s-6 z-10 hidden sm:block">
        <Brand />
      </div>

      <div className="absolute top-6 inset-e-6 z-10 hidden sm:block">
        <LanguageSwitcher />
      </div>

      {hasSlider ? (
        <main className="auth-mobile-viewport flex min-h-[calc(100dvh-4rem)] flex-col justify-start sm:min-h-dvh sm:items-center sm:justify-center sm:overflow-visible sm:px-6 sm:py-10 md:absolute md:inset-0 md:flex-row md:items-center md:justify-center md:overflow-hidden md:p-6">
          <section
            dir={isArabic ? "rtl" : "ltr"}
            style={sliderStyle}
            className="auth-mobile-slider my-auto flex min-h-0 flex-none flex-col gap-0 px-3 pb-3 pt-2 sm:w-full sm:max-w-lg sm:flex-none sm:rounded-3xl sm:p-4 sm:shadow-2xl md:relative md:my-0 md:h-[min(42rem,calc(100dvh-3rem))] md:min-h-[34rem] md:w-[min(70rem,calc(100%-3rem))] md:max-w-none md:flex-row md:overflow-hidden md:rounded-[2rem] md:p-0"
          >
            <WelcomePanel isRegister={isRegister} />
            <div className="auth-mobile-form relative z-10 order-2 -mt-3 min-h-0 min-w-0 flex-none overflow-visible rounded-2xl bg-white px-4 py-3 shadow-xl sm:mt-0 sm:flex-none sm:overflow-visible sm:px-8 sm:py-8 md:absolute md:inset-y-0 md:inset-s-0 md:order-none md:z-0 md:flex md:w-[58%] md:flex-col md:justify-center md:overflow-y-auto md:rounded-none md:bg-transparent md:px-12 md:py-10 md:shadow-none md:transition-transform md:duration-800 md:ease-[cubic-bezier(0.65,0,0.35,1)] md:motion-reduce:transition-none md:translate-x-[var(--auth-form-shift)]">
              <Outlet />
            </div>
          </section>
        </main>
      ) : (
        <main className="flex min-h-[calc(100dvh-4rem)] flex-col sm:min-h-dvh sm:items-center sm:justify-center sm:px-6 sm:py-10 lg:block lg:min-h-0 lg:p-0">
          <div className="absolute bottom-10 inset-s-10 hidden max-w-xl lg:block">
            <h2 className="text-2xl font-extrabold leading-tight text-white">
              {t("auth.panel.headline1")} {t("auth.panel.headline2")}
              <br />
              {t("auth.panel.headline3")}
            </h2>
            <p className="mt-2 text-sm text-white/70">{t("auth.panel.subtitle")}</p>
          </div>
          <div className="mx-3 my-auto w-[calc(100%-1.5rem)] max-w-lg rounded-2xl bg-white px-5 py-6 shadow-2xl sm:mx-0 sm:my-0 sm:w-full sm:rounded-3xl sm:p-8 lg:absolute lg:inset-e-[1%] lg:top-1/2 lg:block lg:w-145 lg:max-w-none lg:-translate-y-1/2">
            <Outlet />
          </div>
        </main>
      )}
    </div>
  );
}

export default AuthLayout;
