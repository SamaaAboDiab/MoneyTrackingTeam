import { useLayoutEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Outlet, useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeftRight } from "lucide-react";
import LanguageSwitcher from "../common/LanguageSwitcher";
import Sidebar from "./Sidebar";
import Breadcrumb from "./appLayout/Breadcrumb";
import DateBadge from "./appLayout/DateBadge";
import UserMenu from "./appLayout/UserMenu";
import MobileNav from "./MobileNav";
import QuickAddButton from "./QuickAddButton";
import useRevealCards from "./appLayout/useRevealCards";
import { ChatUnreadProvider } from "../chat/ChatUnreadContext";
import { fetchMyUnread } from "../../api/chatApi";
import NotificationBell from "../notifications/NotificationBell";
import {
  fetchUserNotifications,
  markAllUserNotificationsRead,
  markUserNotificationRead,
} from "../../api/notificationsApi";

function AppLayout() {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const { pathname } = useLocation();
  const pageRef = useRef(null);
  // A new page always opens at the top (SPA navigation would otherwise keep the old scroll position).
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  useRevealCards(pageRef, pathname);

  return (
    <ChatUnreadProvider fetchUnread={fetchMyUnread} chatPath="/chat">
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <Sidebar />

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
            <Breadcrumb pathname={pathname} t={t} />

            <div className="ms-auto flex items-center gap-2 sm:gap-3">
              <DateBadge />
              <LanguageSwitcher />

              <Link
                to="/accounts/transfer"
                className="hidden items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 md:flex"
              >
                <ArrowLeftRight size={16} />
                {t("layout.quickActionLabel")}
              </Link>

              <NotificationBell
                fetchNotifications={fetchUserNotifications}
                markRead={markUserNotificationRead}
                markAllRead={markAllUserNotificationsRead}
              />
              <UserMenu user={user} />
            </div>
          </header>

          <main className="px-4 pb-28 pt-5 sm:px-6 sm:pt-6 lg:px-8 lg:pb-10">
            {/* Re-keyed per route so each page plays the enter animation (cards then reveal in sequence). */}
            <div key={pathname} ref={pageRef} className="page-enter">
              <Outlet />
            </div>
          </main>
          <MobileNav />
          <QuickAddButton />
        </div>
      </div>
    </div>
    </ChatUnreadProvider>
  );
}

export default AppLayout;
