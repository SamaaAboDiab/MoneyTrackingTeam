import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Sidebar.css";

function Sidebar() {
  const { t } = useTranslation();

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="sidebar-link">
          {t("dashboard.title")}
        </NavLink>
        <NavLink to="/accounts" className="sidebar-link">
          {t("accounts.title")}
        </NavLink>
        <NavLink to="/accounts/transfer" className="sidebar-link">
          {t("transfer.title")}
        </NavLink>
        <NavLink to="/income" className="sidebar-link">
          الدخل
        </NavLink>
        <NavLink to="/expenses" className="sidebar-link">
          المصروفات
        </NavLink>
        <NavLink to="/cash" className="sidebar-link">
          الكاش
        </NavLink>
        <NavLink to="/debts" className="sidebar-link">
          الديون
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;
