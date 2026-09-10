import { LayoutDashboard, Wallet, ArrowLeftRight, TrendingUp, TrendingDown, UserRound } from "lucide-react";

const BREADCRUMB_ITEMS = [
  { match: "/dashboard", key: "dashboard.title", icon: LayoutDashboard },
  { match: "/accounts/transfer", key: "transfer.title", icon: ArrowLeftRight },
  { match: "/accounts", key: "accounts.title", icon: Wallet },
  { match: "/income", key: "nav.income", icon: TrendingUp },
  { match: "/expenses", key: "nav.expenses", icon: TrendingDown },
  { match: "/profile", key: "profile.title", icon: UserRound },
];

function getBreadcrumb(pathname) {
  return BREADCRUMB_ITEMS.find((item) => pathname.startsWith(item.match)) || BREADCRUMB_ITEMS[0];
}

function Breadcrumb({ pathname, t }) {
  const breadcrumb = getBreadcrumb(pathname);
  const Icon = breadcrumb.icon;

  return (
    <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
      <Icon size={16} className="text-slate-400" />
      {t(breadcrumb.key)}
    </div>
  );
}

export default Breadcrumb;
