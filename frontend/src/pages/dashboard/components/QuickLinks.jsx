import { Link } from "react-router-dom";
import { Wallet, ArrowLeftRight, TrendingUp, TrendingDown, ChevronLeft } from "lucide-react";

const QUICK_LINKS = [
  { to: "/accounts", key: "dashboard.accountsLink", icon: Wallet },
  { to: "/income", key: "nav.income", icon: TrendingUp, accent: "income" },
  { to: "/expenses", key: "nav.expenses", icon: TrendingDown, accent: "expense" },
  { to: "/accounts/transfer", key: "dashboard.transferLink", icon: ArrowLeftRight },
];

function QuickLinks({ t }) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {QUICK_LINKS.map(({ to, key, icon: Icon, accent }) => (
        <Link
          key={to}
          to={to}
          className="group flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm shadow-slate-200 ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              accent === "income"
                ? "bg-income-soft text-income"
                : accent === "expense"
                ? "bg-expense-soft text-expense"
                : "bg-brand-50 text-brand-600"
            }`}
          >
            <Icon size={20} strokeWidth={2} />
          </span>
          <span className="flex-1 font-semibold text-slate-800">{t(key)}</span>
          <ChevronLeft size={18} className="text-slate-300 transition group-hover:text-brand-500 rtl:rotate-180" />
        </Link>
      ))}
    </div>
  );
}

export default QuickLinks;
