import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BarChart3,
  ClipboardCheck,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MessagesSquare,
  Settings,
  Users,
} from "lucide-react";
import { adminLogout } from "../../store/slices/adminAuthSlice";
import Sidebar from "./Sidebar";
import { ChatUnreadProvider, useChatUnread } from "../chat/ChatUnreadContext";
import { fetchAdminUnread } from "../../api/chatApi";
import { fetchRenewals } from "../../api/adminExtrasApi";
import usePolling from "../chat/usePolling";
import NotificationBell from "../notifications/NotificationBell";
import {
  fetchAdminNotifications,
  markAllAdminNotificationsRead,
  markAdminNotificationRead,
} from "../../api/notificationsApi";

const ADMIN_NAV_ITEMS = [
  { to: "/admin", key: "admin.layout.home", short: "admin.layout.short.home", icon: LayoutDashboard, primary: true },
  { to: "/admin/users", key: "admin.layout.users", short: "admin.layout.short.users", icon: Users, primary: true },
  { to: "/admin/renewals", key: "admin.layout.renewals", short: "admin.layout.short.renewals", icon: ClipboardCheck, renewals: true, primary: true },
  { to: "/admin/chat", key: "admin.layout.chat", short: "admin.layout.short.chat", icon: MessagesSquare, chat: true, primary: true },
  { to: "/admin/announcements", key: "admin.layout.announcements", short: "admin.layout.short.announcements", icon: Megaphone },
  { to: "/admin/revenue", key: "admin.layout.revenue", short: "admin.layout.short.revenue", icon: BarChart3 },
  { to: "/admin/logs", key: "admin.layout.auditLogs", short: "admin.layout.short.logs", icon: ClipboardList },
  { to: "/admin/settings", key: "admin.layout.settings", short: "admin.layout.short.settings", icon: Settings },
];
const RENEWALS_POLL_MS = 60000;

function isAdminItemActive(to, pathname) {
  return to === "/admin" ? pathname === "/admin" : pathname.startsWith(to);
}

function AdminShell() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { admin } = useSelector((state) => state.adminAuth);
  const { count: unread } = useChatUnread();
  const [pendingRenewals, setPendingRenewals] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);
  const currentItem = ADMIN_NAV_ITEMS.find(({ to }) => isAdminItemActive(to, pathname));

  // Pending renewal requests, for the badge on that section.
  const loadRenewals = useCallback(async () => {
    try {
      const { data } = await fetchRenewals({ status: "pending" });
      setPendingRenewals(data.pendingCount || 0);
    } catch {
      // keep the last count
    }
  }, []);
  usePolling(loadRenewals, RENEWALS_POLL_MS, true, pathname === "/admin/renewals" ? pathname : "");

  // The "More" sheet closes on navigation and on Escape.
  useEffect(() => {
    if (!moreOpen) return undefined;
    const onKey = (event) => event.key === "Escape" && setMoreOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [moreOpen]);

  const navItems = ADMIN_NAV_ITEMS.map((item) => (item.renewals ? { ...item, badge: pendingRenewals } : item));
  const moreItems = navItems.filter((item) => !item.primary);
  const moreActive = moreItems.some(({ to }) => isAdminItemActive(to, pathname));
  const badgeFor = (item) => (item.chat ? unread : item.badge || 0);

  return (
    <div className="min-h-dvh bg-slate-50">
      <div className="flex">
        <Sidebar
          navItems={navItems}
          isItemActive={isAdminItemActive}
          account={admin}
          profileTo={null}
          tagline={t("admin.layout.title")}
          onLogout={() => dispatch(adminLogout())}
        />

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
            <h1 className="min-w-0 truncate text-base font-bold text-slate-900">
              {currentItem ? t(currentItem.key) : t("admin.layout.title")}
            </h1>
            <div className="ms-auto flex shrink-0 items-center gap-2 sm:gap-3">
              <NotificationBell
                fetchNotifications={fetchAdminNotifications}
                markRead={markAdminNotificationRead}
                markAllRead={markAllAdminNotificationsRead}
              />
              <Link
                to="/admin/settings"
                title={admin?.name || admin?.email}
                aria-label={t("admin.layout.settings")}
                className="block rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
              >
                {admin?.avatar ? (
                  <img src={admin.avatar} alt="" className="h-10 w-10 rounded-full object-cover ring-2 ring-white" />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                    {(admin?.name || admin?.email || "?").trim()[0]?.toUpperCase()}
                  </span>
                )}
              </Link>
              {/* Language lives in Settings. The sidebar (with its logout) is hidden below lg. */}
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

          <main className="px-4 pt-5 pb-28 sm:px-6 sm:pt-6 lg:px-8 lg:pb-8">
            <Outlet />
          </main>

          {/* Phones and tablets: the sidebar is hidden, so the main sections sit in a bottom bar
              and the rest open from "More". */}
          {moreOpen && (
            <div className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden" onClick={() => setMoreOpen(false)}>
              <div
                role="dialog"
                aria-label={t("admin.layout.more")}
                onClick={(event) => event.stopPropagation()}
                className="toast-enter absolute inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] mx-auto max-w-md rounded-3xl bg-white p-2 shadow-2xl"
              >
                <ul className="grid grid-cols-2 gap-1">
                  {moreItems.map((item) => {
                    const { to, key, icon: Icon } = item;
                    const active = isAdminItemActive(to, pathname);
                    return (
                      <li key={to}>
                        <NavLink
                          to={to}
                          onClick={() => setMoreOpen(false)}
                          className={`flex min-h-14 items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition ${
                            active ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${active ? "bg-brand-100" : "bg-slate-100"}`}>
                            <Icon size={18} />
                          </span>
                          {t(key)}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}

          <nav
            aria-label={t("admin.layout.navigation")}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur lg:hidden"
          >
            <ul className="mx-auto grid max-w-xl grid-cols-5">
              {navItems.filter((item) => item.primary).map((item) => {
                const { to, short, icon: Icon } = item;
                const active = isAdminItemActive(to, pathname);
                const badge = badgeFor(item);
                return (
                  <li key={to}>
                    <NavLink
                      to={to}
                      end={to === "/admin"}
                      onClick={() => setMoreOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[11px] font-semibold transition ${
                        active ? "text-brand-700" : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      <span className={`relative flex h-7 w-12 items-center justify-center rounded-full transition ${active ? "bg-brand-100" : ""}`}>
                        <Icon size={19} strokeWidth={active ? 2.4 : 2} />
                        {badge > 0 && (
                          <span className="absolute -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-expense px-1 text-[9px] font-bold text-white ring-2 ring-white inset-e-1">
                            {badge > 9 ? "9+" : badge}
                          </span>
                        )}
                      </span>
                      <span className="max-w-full truncate">{t(short)}</span>
                    </NavLink>
                  </li>
                );
              })}
              <li>
                <button
                  type="button"
                  onClick={() => setMoreOpen((value) => !value)}
                  aria-expanded={moreOpen}
                  aria-haspopup="dialog"
                  className={`flex min-h-16 w-full flex-col items-center justify-center gap-1 px-1 text-[11px] font-semibold transition ${
                    moreActive || moreOpen ? "text-brand-700" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <span className={`flex h-7 w-12 items-center justify-center rounded-full transition ${moreActive || moreOpen ? "bg-brand-100" : ""}`}>
                    <Menu size={19} />
                  </span>
                  <span>{t("admin.layout.more")}</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}

function AdminLayout() {
  return (
    <ChatUnreadProvider fetchUnread={fetchAdminUnread} chatPath="/admin/chat">
      <AdminShell />
    </ChatUnreadProvider>
  );
}

export default AdminLayout;
