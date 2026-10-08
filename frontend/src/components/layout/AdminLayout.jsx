import { useDispatch, useSelector } from "react-redux";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ClipboardList, LogOut, ShieldCheck } from "lucide-react";
import { adminLogout } from "../../store/slices/adminAuthSlice";
import LanguageSwitcher from "../common/LanguageSwitcher";

function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { admin } = useSelector((state) => state.adminAuth);

  const handleLogout = () => {
    dispatch(adminLogout());
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <ShieldCheck size={18} strokeWidth={2.25} />
          </span>
          <span className="text-base font-extrabold text-slate-900">{t("admin.layout.title")}</span>
        </div>

        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-1" aria-label={t("admin.layout.navigation")}>
            <NavLink
              to="/admin"
              end
              className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100"}`}
            >
              {t("admin.layout.home")}
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100"}`}
            >
              {t("admin.layout.users")}
            </NavLink>
            <NavLink
              to="/admin/logs"
              className={({ isActive }) => `inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100"}`}
            >
              <ClipboardList size={15} />
              {t("admin.layout.auditLogs")}
            </NavLink>
          </nav>
          {admin?.email && (
            <span dir="ltr" className="hidden text-sm text-slate-500 sm:inline">{admin.email}</span>
          )}
          <LanguageSwitcher />
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-expense hover:text-expense"
          >
            <LogOut size={16} />
            {t("admin.layout.logout")}
          </button>
        </div>
      </header>

      <main className="p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
