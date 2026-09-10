import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { logout } from "../../store/slices/authSlice";
import ConfirmModal from "../common/ConfirmModal";
import SidebarHeader from "./sidebar/SidebarHeader";
import SidebarNav from "./sidebar/SidebarNav";
import SidebarUpgradeCard from "./sidebar/SidebarUpgradeCard";
import SidebarUserSection from "./sidebar/SidebarUserSection";

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

  return (
    <aside
      className={`sticky top-0 hidden h-screen shrink-0 flex-col overflow-y-auto border-e border-slate-200 bg-white transition-all duration-200 sm:flex ${
        collapsed ? "w-24" : "w-64"
      }`}
    >
      <SidebarHeader collapsed={collapsed} onToggleCollapsed={() => setCollapsed((prev) => !prev)} t={t} />

      <div className="border-t border-slate-100" />

      <SidebarNav collapsed={collapsed} pathname={pathname} t={t} />

      <div className="p-3">
        <SidebarUpgradeCard collapsed={collapsed} t={t} />
        <SidebarUserSection
          collapsed={collapsed}
          user={user}
          onLogoutClick={() => setConfirmingLogout(true)}
          t={t}
        />
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
