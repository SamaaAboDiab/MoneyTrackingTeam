import { useSelector } from "react-redux";
import { Outlet, useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeftRight } from "lucide-react";
import LanguageSwitcher from "../common/LanguageSwitcher";
import Sidebar from "./Sidebar";
import Breadcrumb from "./appLayout/Breadcrumb";
import DateBadge from "./appLayout/DateBadge";
import NotificationsButton from "./appLayout/NotificationsButton";
import UserAvatarLink from "./appLayout/UserAvatarLink";

function AppLayout() {
  const { t, i18n } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <Sidebar />

        <div className="min-w-0 flex-1">
          <header className="flex flex-wrap items-center gap-4 border-b border-slate-200 bg-white px-6 py-3.5">
            <Breadcrumb pathname={pathname} t={t} />

            <div className="ms-auto flex items-center gap-3">
              <DateBadge language={i18n.language} />
              <LanguageSwitcher />
              <NotificationsButton t={t} />

              <Link
                to="/accounts/transfer"
                className="hidden items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 sm:flex"
              >
                <ArrowLeftRight size={16} />
                {t("layout.quickActionLabel")}
              </Link>

              <UserAvatarLink user={user} />
            </div>
          </header>

          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
