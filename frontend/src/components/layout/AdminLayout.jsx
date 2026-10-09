import { useDispatch, useSelector } from "react-redux";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ClipboardList, LayoutDashboard, LogOut, Users } from "lucide-react";
import { adminLogout } from "../../store/slices/adminAuthSlice";
import LanguageSwitcher from "../common/LanguageSwitcher";
import Sidebar from "./Sidebar";

const ADMIN_NAV_ITEMS = [
  { to: "/admin", key: "admin.layout.home", icon: LayoutDashboard },
  { to: "/admin/users", key: "admin.layout.users", icon: Users },
  { to: "/admin/logs", key: "admin.layout.auditLogs", icon: ClipboardList },
];

function isAdminItemActive(to, pathname) {
  return to === "/admin" ? pathname === "/admin" : pathname.startsWith(to);
}

function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { admin } = useSelector((state) => state.adminAuth);
  const currentItem = ADMIN_NAV_ITEMS.find(({ to }) => isAdminItemActive(to, pathname));

  return (
    <div className="min-h-dvh bg-slate-50">
      <div className="flex">
        <Sidebar
          navItems={ADMIN_NAV_ITEMS}
          isItemActive={isAdminItemActive}
          account={admin}
          profileTo={null}
          tagline={t("admin.layout.title")}
          onLogout={() => dispatch(adminLogout())}
        />

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
            <h1 className="text-base font-bold text-slate-900">
              {currentItem ? t(currentItem.key) : t("admin.layout.title")}
            </h1>
            <div className="ms-auto flex items-center gap-2 sm:gap-3">
              <LanguageSwitcher />
              {/* The sidebar (with its logout) is hidden below lg. */}
              <button
                type="button"
                onClick={() => {
                  dispatch(adminLogout());
                  navigate("/login", { replace: true });
                }}
                aria-label={t("admin.layout.logout")}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-expense transition hover:bg-expense-soft lg:hidden"
              >
                <LogOut size={18} />
              </button>
            </div>
          </header>

          {/* Phones and tablets: the sidebar is hidden there, so the sections show as tabs. */}
          <nav
            aria-label={t("admin.layout.navigation")}
            className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2 lg:hidden"
          >
            {ADMIN_NAV_ITEMS.map(({ to, key, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/admin"}
                className={({ isActive }) =>
                  `inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                <Icon size={16} />
                {t(key)}
              </NavLink>
            ))}
          </nav>

          <main className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
