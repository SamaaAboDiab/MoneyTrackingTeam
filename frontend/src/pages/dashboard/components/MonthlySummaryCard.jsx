import { TrendingUp, TrendingDown, Wallet, ArrowUp, ArrowDown } from "lucide-react";
import { formatAmount } from "../../../utils/formatAmount";

const PERIOD_OPTIONS = ["month", "last_month", "3months", "custom"];

function MonthlySummaryCard({ data, status, period, onPeriodChange, from, to, onFromChange, onToChange, t }) {
  const income = data?.income?.total ?? 0;
  const expenses = data?.expenses?.total ?? 0;
  const net = data?.netBalance ?? income - expenses;
  const isPositive = net >= 0;
  const previous = data?.prev;
  const formatPeriodDate = (date) => {
    if (!date) return "";
    const parsedDate = new Date(date);
    return Number.isNaN(parsedDate.getTime())
      ? ""
      : parsedDate.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  };
  const selectedPeriod = data?.period;
  const selectedPeriodLabel = selectedPeriod?.start && selectedPeriod?.end
    ? `${formatPeriodDate(selectedPeriod.start)} - ${formatPeriodDate(selectedPeriod.end)}`
    : period === "custom" && from && to
      ? `${formatPeriodDate(from)} - ${formatPeriodDate(to)}`
      : t(`dashboard.period.${period}`);
  const renderComparison = (current, previousValue, type) => {
    const hasPreviousValue = previousValue !== null && previousValue !== undefined;
    if (!hasPreviousValue) {
      return (
        <div className="mt-4 border-t border-white/70 pt-3">
          <p className="text-xs font-semibold text-slate-500">{t("dashboard.summary.previousPeriod")}</p>
          <p className="mt-1 text-xs font-medium text-slate-500">{t("dashboard.summary.noComparison")}</p>
        </div>
      );
    }

    const difference = current - previousValue;
    const percentage = previousValue === 0 ? null : Math.abs((difference / Math.abs(previousValue)) * 100);
    const isImprovement = type === "income" ? difference >= 0 : difference <= 0;
    const ComparisonIcon = isImprovement ? ArrowUp : ArrowDown;

    return (
      <div className="mt-4 space-y-2 border-t border-white/70 pt-3 text-xs">
        <div className="flex items-center justify-between gap-2 text-slate-600">
          <span>{t("dashboard.summary.currentPeriod")}</span>
          <span className="tabular-amount font-bold">{formatAmount(current)} EGP</span>
        </div>
        <div className="flex items-center justify-between gap-2 text-slate-600">
          <span>{t("dashboard.summary.previousPeriod")}</span>
          <span className="tabular-amount font-bold">{formatAmount(previousValue)} EGP</span>
        </div>
        <div className={`flex flex-wrap items-center justify-between gap-2 font-bold ${isImprovement ? "text-income" : "text-expense"}`}>
          <span className="flex items-center gap-1">
            <ComparisonIcon size={14} strokeWidth={2.5} />
            {t("dashboard.summary.difference")}
          </span>
          <span className="tabular-amount">
            {difference >= 0 ? "+" : "−"}{formatAmount(Math.abs(difference))} EGP
            <span className="ms-1">({percentage === null ? t("dashboard.summary.notAvailable") : `${percentage.toFixed(1)}%`})</span>
          </span>
        </div>
      </div>
    );
  };

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

      {period === "custom" && (
        <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-600">
            {t("dashboard.period.from")}
            <input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(event) => onFromChange(event.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
            />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            {t("dashboard.period.to")}
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(event) => onToChange(event.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
            />
          </label>
        </div>
      )}

      <p className="mt-4 text-sm font-semibold text-slate-600">
        {t("dashboard.period.selected")}: <span className="text-slate-900">{selectedPeriodLabel}</span>
      </p>
      {period === "custom" && from && to && from > to && (
        <p className="mt-2 text-xs font-semibold text-expense">{t("dashboard.period.invalid")}</p>
      )}

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
            {renderComparison(income, previous?.income?.total, "income")}
          </div>

          <div className="rounded-xl bg-expense-soft/40 p-4">
            <div className="flex items-center gap-2 text-expense">
              <TrendingDown size={16} />
              <span className="text-xs font-semibold">{t("dashboard.summary.expenses")}</span>
            </div>
            <p className="tabular-amount mt-2 text-xl font-extrabold text-slate-900">
              {formatAmount(expenses)} EGP
            </p>
            {renderComparison(expenses, previous?.expenses?.total, "expenses")}
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
