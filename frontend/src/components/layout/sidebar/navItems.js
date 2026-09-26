import { LayoutDashboard, Wallet, TrendingUp, TrendingDown, CreditCard, Banknote } from "lucide-react";

export const NAV_ITEMS = [
  { to: "/dashboard", key: "dashboard.title", icon: LayoutDashboard },
  { to: "/income", key: "nav.income", icon: TrendingUp },
  { to: "/expenses", key: "nav.expenses", icon: TrendingDown },
  { to: "/accounts", key: "accounts.title", icon: Wallet },
  { to: "/cash", key: "nav.cash", icon: Banknote },
  { to: "/debts", key: "nav.debts", icon: CreditCard },
];

export function isNavItemActive(to, pathname) {
  if (to === "/accounts") {
    return pathname === "/accounts" || (pathname.startsWith("/accounts/") && !pathname.startsWith("/accounts/transfer"));
  }
  if (to === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname.startsWith(to);
}
