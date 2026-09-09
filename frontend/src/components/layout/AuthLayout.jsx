import { Outlet } from "react-router-dom";
import LanguageSwitcher from "../common/LanguageSwitcher";

function AuthLayout() {
  return (
    <div className="min-h-screen bg-linear-to-br from-brand-50 via-white to-slate-50">
      <header className="flex items-center justify-end gap-3 p-4">
        <LanguageSwitcher />
      </header>
      <Outlet />
    </div>
  );
}

export default AuthLayout;
