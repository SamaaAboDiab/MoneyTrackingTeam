import { Outlet } from "react-router-dom";
import LanguageSwitcher from "../common/LanguageSwitcher";
import "./AuthLayout.css";

function AuthLayout() {
  return (
    <div className="auth-layout">
      <header className="auth-layout-header">
        <LanguageSwitcher />
      </header>
      <Outlet />
    </div>
  );
}

export default AuthLayout;
