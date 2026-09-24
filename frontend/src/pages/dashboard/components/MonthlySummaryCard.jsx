import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { formatAmount } from "../../../utils/formatAmount";

const PERIOD_OPTIONS = ["month", "last_month", "3months"];

function MonthlySummaryCard({ data, status, period, onPeriodChange, t }) {
  const income = data?.income?.total ?? 0;
  const expenses = data?.expenses?.total ?? 0;
  const net = data?.netBalance ?? income - expenses;
  const isPositive = net >= 0;

  return (
    <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">{t("dashboard.summary.title")}</h2>
        <select
          value={period}
          onChange={(event) => onPeriodChange(event.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-brand-500"
        >
          {PERIOD_OPTIONS.map((key) => (
            <option key={key} value={key}>
              {t(`dashboard.period.${key}`)}
            </option>
          ))}
        </select>
      </div>

      {status === "loading" && !data ? (
        <p className="mt-4 text-sm text-slate-500">{t("dashboard.summary.loading")}</p>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-income-soft/40 p-4">
            <div className="flex items-center gap-2 text-income">
              <TrendingUp size={16} />
              <span className="text-xs font-semibold">{t("dashboard.summary.income")}</span>
            </div>
            <p className="tabular-amount mt-2 text-xl font-extrabold text-slate-900">
              {formatAmount(income)} EGP
            </p>
          </div>

          <div className="rounded-xl bg-expense-soft/40 p-4">
            <div className="flex items-center gap-2 text-expense">
              <TrendingDown size={16} />
              <span className="text-xs font-semibold">{t("dashboard.summary.expenses")}</span>
            </div>
            <p className="tabular-amount mt-2 text-xl font-extrabold text-slate-900">
              {formatAmount(expenses)} EGP
            </p>
          </div>

          <div className={`rounded-xl p-4 ${isPositive ? "bg-income-soft/40" : "bg-expense-soft/40"}`}>
            <div className={`flex items-center gap-2 ${isPositive ? "text-income" : "text-expense"}`}>
              <Wallet size={16} />
              <span className="text-xs font-semibold">
                {isPositive ? t("dashboard.summary.net") : t("dashboard.summary.deficit")}
              </span>
            </div>
            <p className={`tabular-amount mt-2 text-xl font-extrabold ${isPositive ? "text-income" : "text-expense"}`}>
              {formatAmount(Math.abs(net))} EGP
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

export default MonthlySummaryCard;
