import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Gem,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { logout } from "../../store/slices/authSlice";
import ConfirmModal from "../common/ConfirmModal";

const NAV_ITEMS = [
  { to: "/dashboard", key: "dashboard.title", icon: LayoutDashboard },
  { to: "/accounts", key: "accounts.title", icon: Wallet },
  { to: "/income", key: "nav.income", icon: TrendingUp },
  { to: "/expenses", key: "nav.expenses", icon: TrendingDown },
  { to: "/accounts/transfer", key: "transfer.title", icon: ArrowLeftRight },
];

function isNavItemActive(to, pathname) {
  if (to === "/accounts") {
    return pathname === "/accounts" || (pathname.startsWith("/accounts/") && !pathname.startsWith("/accounts/transfer"));
  }
  if (to === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname.startsWith(to);
}

function Sidebar() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const handleConfirmLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const initial = user?.name?.trim()?.[0]?.toUpperCase() || "?";

  return (
    <aside
      className={`sticky top-0 hidden h-screen shrink-0 flex-col overflow-y-auto border-e border-slate-200 bg-white transition-all duration-200 sm:flex ${
        collapsed ? "w-24" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between gap-1.5 px-3 py-4">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Wallet size={18} strokeWidth={2.25} />
          </span>
          {!collapsed && (
            <span className="truncate text-base font-extrabold leading-tight text-slate-900">
              {t("layout.brand")}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={t(collapsed ? "layout.expandSidebar" : "layout.collapseSidebar")}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
        >
          {collapsed ? (
            <ChevronRight size={16} className="rtl:rotate-180" />
          ) : (
            <ChevronLeft size={16} className="rtl:rotate-180" />
          )}
        </button>
      </div>

      <div className="border-t border-slate-100" />

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map(({ to, key, icon: Icon }) => {
          const isActive = isNavItemActive(to, pathname);
          return (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? t(key) : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
              collapsed ? "justify-center" : ""
            } ${
              isActive
                ? "bg-brand-600 text-white"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Icon size={18} strokeWidth={2} />
            {!collapsed && t(key)}
          </NavLink>
          );
        })}
      </nav>

      <div className="p-3">
        {!collapsed ? (
          <div className="rounded-2xl bg-slate-50 p-4 text-center ring-1 ring-slate-100">
            <Gem size={20} className="mx-auto text-brand-600" />
            <p className="mt-2 text-sm font-bold text-slate-900">{t("layout.upgradeTitle")}</p>
            <p className="mt-0.5 text-xs text-slate-500">{t("layout.upgradeSubtitle")}</p>
            <button
              type="button"
              className="mt-3 w-full rounded-lg bg-brand-600 py-2 text-xs font-bold text-white transition hover:bg-brand-700"
            >
              {t("layout.upgradeButton")}
            </button>
          </div>
        ) : (
          <button
            type="button"
            title={t("layout.upgradeTitle")}
            className="flex h-10 w-full items-center justify-center rounded-xl bg-slate-50 text-brand-600 ring-1 ring-slate-100 transition hover:bg-slate-100"
          >
            <Gem size={18} />
          </button>
        )}

        <div className="mt-3 border-t border-slate-100 pt-3">
          {!collapsed ? (
            <div className="flex items-center gap-3 px-1">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {initial}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">{user?.name}</p>
                <p className="truncate text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>
          ) : (
            <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
              {initial}
            </span>
          )}

          <button
            type="button"
            onClick={() => setConfirmingLogout(true)}
            title={collapsed ? t("layout.logout") : undefined}
            className={`mt-3 flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-semibold text-expense transition hover:bg-expense-soft ${
              collapsed ? "w-full justify-center" : "w-full"
            }`}
          >
            <LogOut size={18} />
            {!collapsed && t("layout.logout")}
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmingLogout}
        onClose={() => setConfirmingLogout(false)}
        onConfirm={handleConfirmLogout}
        confirmVariant="destructive"
        title={t("layout.logoutConfirmTitle")}
        description={t("layout.logoutConfirmMessage")}
        cancelLabel={t("layout.cancel")}
        confirmLabel={t("layout.logout")}
      />
    </aside>
  );
}

export default Sidebar;
