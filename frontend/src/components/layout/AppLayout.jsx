import { useDispatch, useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { logout } from "../../store/slices/authSlice";
import LanguageSwitcher from "../common/LanguageSwitcher";
import Sidebar from "./Sidebar";
import "./AppLayout.css";

function AppLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <span className="app-brand">{t("layout.brand")}</span>
        <div className="app-header-actions">
          {user && <span className="app-user-name">{user.name}</span>}
          <LanguageSwitcher />
          <button type="button" className="logout-btn" onClick={handleLogout}>
            {t("layout.logout")}
          </button>
        </div>
      </header>

      <div className="app-body">
        <Sidebar />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
