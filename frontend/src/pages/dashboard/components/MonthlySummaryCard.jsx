import { TrendingUp, TrendingDown, Wallet, ArrowUp, ArrowDown } from "lucide-react";
import { formatMoney, formatDate, formatPercent, currencyName } from "../../../utils/formatAmount";
import DatePicker from "../../../components/common/DatePicker";
import Select from "../../../components/common/Select";
import { StatsSkeleton } from "../../../components/common/Skeleton";

const PERIOD_OPTIONS = ["month", "last_month", "3months", "custom"];

function MonthlySummaryCard({
  data,
  status,
  period,
  onPeriodChange,
  from,
  to,
  onFromChange,
  onToChange,
  currency = "EGP",
  currencies = [],
  onCurrencyChange,
  t,
}) {
  const income = data?.income?.total ?? 0;
  const expenses = data?.expenses?.total ?? 0;
  const net = data?.netBalance ?? income - expenses;
  const isPositive = net >= 0;
  const previous = data?.prev;
  const formatPeriodDate = (date) => formatDate(date);
  const selectedPeriod = data?.period;
  const selectedPeriodLabel = selectedPeriod?.start && selectedPeriod?.end
    ? `${formatPeriodDate(selectedPeriod.start)} - ${formatPeriodDate(selectedPeriod.end)}`
    : period === "custom" && from && to
      ? `${formatPeriodDate(from)} - ${formatPeriodDate(to)}`
      : t(`dashboard.period.${period}`);

  const prevIncome = previous?.income?.total;
  const prevExpenses = previous?.expenses?.total;
  const hasPrevNet = prevIncome != null || prevExpenses != null;
  const prevNet = hasPrevNet ? Number(prevIncome || 0) - Number(prevExpenses || 0) : null;
  const savingsRate = income > 0 ? (net / income) * 100 : null;

  // Small pill with the change vs the previous period; green when the change is good for this metric.
  const renderDelta = (current, previousValue, type) => {
    if (previousValue === null || previousValue === undefined || previousValue === 0) return null;
    const difference = current - previousValue;
    if (difference === 0) return null;
    const percentage = Math.abs((difference / Math.abs(previousValue)) * 100);
    const isImprovement = type === "expenses" ? difference < 0 : difference > 0;
    const Icon = difference > 0 ? ArrowUp : ArrowDown;
    return (
      <span
        className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${
          isImprovement ? "bg-income/10 text-income" : "bg-expense/10 text-expense"
        }`}
      >
        <Icon size={12} strokeWidth={2.5} />
        <span className="tabular-amount">{formatPercent(percentage, percentage < 10 ? 1 : 0)}</span>
      </span>
    );
  };

  // One line under each tile: the same metric for the previous period.
  const renderPrevious = (value) => (
    <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/80 pt-2.5 text-xs text-slate-500">
      <span>{t("dashboard.summary.previousPeriod")}</span>
      <span className="tabular-amount font-bold text-slate-700">
        {value === null || value === undefined ? t("dashboard.summary.notAvailable") : formatMoney(value, currency)}
      </span>
    </div>
  );

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm shadow-slate-200 ring-1 ring-slate-100 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-slate-900">{t("dashboard.summary.title")}</h2>
          <p className="mt-0.5 text-xs font-medium text-slate-500">
            {t("dashboard.period.selected")}: <span className="font-semibold text-slate-700">{selectedPeriodLabel}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Amounts are never mixed across currencies; switch only when the user has more than one. */}
          {currencies.length > 1 && (
            <div role="group" aria-label={t("dashboard.summary.currency")} className="inline-flex rounded-xl bg-slate-100 p-1">
              {currencies.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => onCurrencyChange?.(code)}
                  aria-pressed={code === currency}
                  title={currencyName(code)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    code === currency ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>
          )}
          <Select
            value={period}
            onChange={(event) => onPeriodChange(event.target.value)}
            className="min-w-48 bg-slate-50/60 px-4 py-2 text-sm font-medium text-slate-700"
          >
            {PERIOD_OPTIONS.map((key) => (
              <option key={key} value={key}>
                {t(`dashboard.period.${key}`)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {period === "custom" && (
        <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-2">
          <div>
            <label htmlFor="summary-from" className="text-xs font-semibold text-slate-600">{t("dashboard.period.from")}</label>
            <DatePicker
              id="summary-from"
              value={from}
              max={to || undefined}
              onChange={onFromChange}
              className="mt-1 flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
            />
          </div>
          <div>
            <label htmlFor="summary-to" className="text-xs font-semibold text-slate-600">{t("dashboard.period.to")}</label>
            <DatePicker
              id="summary-to"
              value={to}
              min={from || undefined}
              onChange={onToChange}
              className="mt-1 flex w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
            />
          </div>
        </div>
      )}

      {period === "custom" && from && to && from > to && (
        <p className="mt-2 text-xs font-semibold text-expense">{t("dashboard.period.invalid")}</p>
      )}

      {status === "loading" && !data ? (
        <StatsSkeleton bare count={3} className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3" label={t("dashboard.summary.loading")} />
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-income-soft/40 p-4">
            <div className="flex items-center gap-2 text-income">
              <TrendingUp size={16} />
              <span className="text-xs font-semibold">{t("dashboard.summary.income")}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <p className="tabular-amount text-xl font-extrabold text-slate-900">{formatMoney(income, currency)}</p>
              {renderDelta(income, prevIncome, "income")}
            </div>
            {renderPrevious(prevIncome)}
          </div>

          <div className="rounded-xl bg-expense-soft/40 p-4">
            <div className="flex items-center gap-2 text-expense">
              <TrendingDown size={16} />
              <span className="text-xs font-semibold">{t("dashboard.summary.expenses")}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <p className="tabular-amount text-xl font-extrabold text-slate-900">{formatMoney(expenses, currency)}</p>
              {renderDelta(expenses, prevExpenses, "expenses")}
            </div>
            {renderPrevious(prevExpenses)}
          </div>

          <div className={`rounded-xl p-4 ${isPositive ? "bg-income-soft/40" : "bg-expense-soft/40"}`}>
            <div className="flex items-center justify-between gap-2">
              <div className={`flex items-center gap-2 ${isPositive ? "text-income" : "text-expense"}`}>
                <Wallet size={16} />
                <span className="text-xs font-semibold">
                  {isPositive ? t("dashboard.summary.net") : t("dashboard.summary.deficit")}
                </span>
              </div>
              {savingsRate !== null && (
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                  {t("dashboard.summary.savingsRate")}{" "}
                  <span className="tabular-amount font-bold text-slate-900">{formatPercent(savingsRate, 0)}</span>
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <p className={`tabular-amount text-xl font-extrabold ${isPositive ? "text-income" : "text-expense"}`}>
                {formatMoney(Math.abs(net), currency)}
              </p>
              {renderDelta(net, prevNet, "income")}
            </div>
            {renderPrevious(prevNet)}
          </div>
        </div>
      )}
    </section>
  );
}

export default MonthlySummaryCard;
