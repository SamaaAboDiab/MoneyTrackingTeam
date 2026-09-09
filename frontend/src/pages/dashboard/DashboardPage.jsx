import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Wallet,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  Landmark,
  Smartphone,
  Banknote,
} from "lucide-react";
import { fetchAccounts } from "../../store/slices/accountsSlice";
import { formatAmount } from "../../utils/formatAmount";
import TotalWealthCard from "../../components/dashboard/TotalWealthCard";

const QUICK_LINKS = [
  { to: "/accounts", key: "dashboard.accountsLink", icon: Wallet },
  { to: "/income", key: "nav.income", icon: TrendingUp, accent: "income" },
  { to: "/expenses", key: "nav.expenses", icon: TrendingDown, accent: "expense" },
  { to: "/accounts/transfer", key: "dashboard.transferLink", icon: ArrowLeftRight },
];

const ACCOUNT_TYPE_ICON = {
  bank: Landmark,
  wallet: Smartphone,
  cash: Banknote,
};

function DashboardPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items, status } = useSelector((state) => state.accounts);

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  const activeAccounts = items.filter((account) => !account.isArchived);
  const totalsByCurrency = activeAccounts.reduce((totals, account) => {
    const currency = account.currency || "EGP";
    totals[currency] = (totals[currency] || 0) + (Number(account.balance) || 0);
    return totals;
  }, {});
  const totalCurrencies = Object.entries(totalsByCurrency);

  return (
    <div>
      {/* Greeting */}
      {user && (
        <div className="mb-6">
          <h1 className="text-xl font-extrabold text-slate-900">
            {t("dashboard.greeting", { name: user.name })}
          </h1>
        </div>
      )}

      {/* Total Balance hero */}
      {status === "loading" ? (
        <div className="rounded-3xl bg-brand-600 p-6 text-white sm:p-8">
          <p className="text-sm font-medium text-white/70">{t("accounts.totalWealth")}</p>
          <p className="mt-2 text-2xl font-extrabold">{t("accounts.loading")}</p>
        </div>
      ) : totalCurrencies.length === 0 ? (
        <div className="rounded-3xl bg-brand-600 p-6 text-white sm:p-8">
          <p className="text-sm font-medium text-white/70">{t("accounts.totalWealth")}</p>
          <p className="mt-2 text-lg font-semibold text-white/90">{t("accounts.noBalance")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {totalCurrencies.map(([currency, total]) => (
            <TotalWealthCard
              key={currency}
              label={t("accounts.totalWealth")}
              amount={total}
              currency={currency}
              showAriaLabel={t("common.showAmount")}
              hideAriaLabel={t("common.hideAmount")}
            />
          ))}
        </div>
      )}

      {/* Quick links */}
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
            <ChevronLeft
              size={18}
              className="text-slate-300 transition group-hover:text-brand-500 rtl:rotate-180"
            />
          </Link>
        ))}
      </div>

      {/* My Accounts preview */}
      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">{t("accounts.listTitle")}</h2>
          <Link to="/accounts" className="text-sm font-semibold text-brand-700 hover:underline">
            {t("accounts.title")}
          </Link>
        </div>

        {status === "succeeded" && activeAccounts.length === 0 && (
          <p className="mt-3 text-slate-500">{t("accounts.empty")}</p>
        )}

        <div className="mt-4 flex flex-col gap-3">
          {activeAccounts.slice(0, 4).map((account) => {
            const Icon = ACCOUNT_TYPE_ICON[account.type] || Wallet;
            return (
              <Link
                key={account._id}
                to={`/accounts/${account._id}/transactions`}
                className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-slate-50"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <Icon size={16} />
                </span>
                <span className="min-w-0 flex-1 truncate font-medium text-slate-700">
                  {account.name}
                </span>
                <span className="tabular-amount font-bold text-slate-900">
                  {formatAmount(account.balance)} {account.currency}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
