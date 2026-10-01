import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LayoutGrid, X } from "lucide-react";
import { NAV_ITEMS, MOBILE_PRIMARY_PATHS, isNavItemActive } from "./sidebar/navItems";

const SHORT_LABEL_KEYS = {
  "dashboard.title": "layout.mobileNav.home",
  "accounts.title": "layout.mobileNav.accounts",
};

const PRIMARY_ITEMS = NAV_ITEMS.filter((item) => MOBILE_PRIMARY_PATHS.includes(item.to));
const MORE_ITEMS = NAV_ITEMS.filter((item) => !MOBILE_PRIMARY_PATHS.includes(item.to));

function MobileNav() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = MORE_ITEMS.some(({ to }) => isNavItemActive(to, pathname));

  // The sheet closes when a link in it is chosen (see NavLink onClick) and on Escape.
  useEffect(() => {
    if (!moreOpen) return undefined;
    const onKey = (event) => event.key === "Escape" && setMoreOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [moreOpen]);

  const tabClass = (active) =>
    `flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[11px] font-semibold transition-colors ${
      active ? "text-brand-700" : "text-slate-400 hover:text-slate-600"
    }`;
  const iconWrap = (active) =>
    `flex h-7 w-12 items-center justify-center rounded-full transition-colors ${active ? "bg-brand-100" : ""}`;

  return (
    <>
      {moreOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-slate-900/40" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("layout.mobileNav.more")}
            onClick={(event) => event.stopPropagation()}
            className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] pt-3 shadow-2xl"
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-200" />
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">{t("layout.mobileNav.more")}</h2>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                aria-label={t("common.close")}
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            <ul className="mx-auto grid max-w-xl grid-cols-3 gap-2 sm:grid-cols-4">
              {MORE_ITEMS.map(({ to, key, icon: Icon }) => {
                const active = isNavItemActive(to, pathname);
                return (
                  <li key={to}>
                    <NavLink
                      to={to}
                      onClick={() => setMoreOpen(false)}
                      className={`flex flex-col items-center gap-2 rounded-2xl p-3 text-center text-xs font-semibold transition ${
                        active ? "bg-brand-600 text-white" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Icon size={20} />
                      <span className="leading-tight">{t(key)}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      <nav
        aria-label={t("layout.primaryNav")}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur lg:hidden"
      >
        <ul className="mx-auto grid max-w-xl grid-cols-5">
          {PRIMARY_ITEMS.map(({ to, key, icon: Icon }) => {
            const active = isNavItemActive(to, pathname);
            return (
              <li key={to}>
                <NavLink to={to} className={tabClass(active)} aria-current={active ? "page" : undefined}>
                  <span className={iconWrap(active)}>
                    <Icon size={19} strokeWidth={active ? 2.4 : 2} />
                  </span>
                  <span className="max-w-full truncate">{t(SHORT_LABEL_KEYS[key] || key)}</span>
                </NavLink>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen((prev) => !prev)}
              aria-expanded={moreOpen}
              aria-haspopup="dialog"
              className={`w-full ${tabClass(moreActive || moreOpen)}`}
            >
              <span className={iconWrap(moreActive || moreOpen)}>
                <LayoutGrid size={19} strokeWidth={moreActive || moreOpen ? 2.4 : 2} />
              </span>
              <span className="max-w-full truncate">{t("layout.mobileNav.more")}</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}

export default MobileNav;
