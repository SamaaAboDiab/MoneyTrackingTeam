import { useSelector } from "react-redux";
import { Outlet, useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bell, Calendar, ArrowLeftRight, LayoutDashboard, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import LanguageSwitcher from "../common/LanguageSwitcher";
import Sidebar from "./Sidebar";

const BREADCRUMB_ITEMS = [
  { match: "/dashboard", key: "dashboard.title", icon: LayoutDashboard },
  { match: "/accounts/transfer", key: "transfer.title", icon: ArrowLeftRight },
  { match: "/accounts", key: "accounts.title", icon: Wallet },
  { match: "/income", key: "nav.income", icon: TrendingUp },
  { match: "/expenses", key: "nav.expenses", icon: TrendingDown },
];

function getBreadcrumb(pathname) {
  return (
    BREADCRUMB_ITEMS.find((item) => pathname.startsWith(item.match)) || BREADCRUMB_ITEMS[0]
  );
}

function AppLayout() {
  const { t, i18n } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const { pathname } = useLocation();

  const initial = user?.name?.trim()?.[0]?.toUpperCase() || "?";
  const breadcrumb = getBreadcrumb(pathname);
  const BreadcrumbIcon = breadcrumb.icon;

  const today = new Intl.DateTimeFormat(i18n.language === "ar" ? "ar-EG" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <Sidebar />

        <div className="min-w-0 flex-1">
          <header className="flex flex-wrap items-center gap-4 border-b border-slate-200 bg-white px-6 py-3.5">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <BreadcrumbIcon size={16} className="text-slate-400" />
              {t(breadcrumb.key)}
            </div>

            <div className="ms-auto flex items-center gap-3">
              <span className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 sm:flex">
                <Calendar size={16} className="text-slate-400" />
                {today}
              </span>

              <LanguageSwitcher />

              <button
                type="button"
                aria-label={t("layout.notifications")}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
              >
                <Bell size={18} />
              </button>

              <Link
                to="/accounts/transfer"
                className="hidden items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 sm:flex"
              >
                <ArrowLeftRight size={16} />
                {t("layout.quickActionLabel")}
              </Link>

              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {initial}
              </span>
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
