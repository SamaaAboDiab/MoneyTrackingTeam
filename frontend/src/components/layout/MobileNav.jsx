import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NAV_ITEMS, isNavItemActive } from "./sidebar/navItems";

const SHORT_LABEL_KEYS = {
  "dashboard.title": "layout.mobileNav.home",
  "accounts.title": "layout.mobileNav.accounts",
};

function MobileNav() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom,0px)] sm:hidden"
    >
      <ul className="grid grid-cols-6">
        {NAV_ITEMS.map(({ to, key, icon: Icon }) => {
          const isActive = isNavItemActive(to, pathname);
          return (
            <li key={to}>
              <NavLink
                to={to}
                className={`flex flex-col items-center gap-0.5 px-1 py-2.5 text-xs font-semibold transition-colors ${
                  isActive ? "text-brand-700" : "text-slate-400"
                }`}
              >
                <span
                  className={`flex h-7 w-10 items-center justify-center rounded-full transition-colors ${
                    isActive ? "bg-brand-100" : ""
                  }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.4 : 2} />
                </span>
                <span className="max-w-full truncate">{t(SHORT_LABEL_KEYS[key] || key)}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default MobileNav;
