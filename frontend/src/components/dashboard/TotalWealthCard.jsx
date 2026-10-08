import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, ArrowDownRight, Wallet, Scale } from "lucide-react";
import { formatMoney, currencyName } from "../../utils/formatAmount";

function TotalWealthCard({
  label,
  amount,
  currency,
  onOpenAccounts,
  trendData = [],
  accountsCount,
  periodIncome,
  periodExpenses,
  periodLabel,
  currencies = [],
  onCurrencyChange,
}) {
  const { t } = useTranslation();
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const maxTrendValue = trendData.length ? Math.max(...trendData, 1) : 0;
  const showPeriod = Number.isFinite(periodIncome) || Number.isFinite(periodExpenses);
  const net = Number(periodIncome || 0) - Number(periodExpenses || 0);

  // text-income/text-expense are tuned for white cards; on this dark card they read as dull/washed
  // out, so the brighter dark-mode-friendly tints below are used here instead.
  const stats = [
    { key: "income", icon: ArrowUpRight, tone: "text-emerald-400", label: t("dashboard.wealth.income"), value: periodIncome },
    { key: "expenses", icon: ArrowDownRight, tone: "text-rose-400", label: t("dashboard.wealth.expenses"), value: periodExpenses },
    { key: "net", icon: Scale, tone: net >= 0 ? "text-emerald-400" : "text-rose-400", label: t("dashboard.wealth.net"), value: net },
  ];

  return (
    <div className="relative h-full">
      <div
        role="button"
        tabIndex={0}
        onClick={onOpenAccounts}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") onOpenAccounts();
        }}
        className={`relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-3xl bg-navy-900 p-6 text-white transition-all duration-300 ease-out sm:p-7 ${
          grown ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Top row: label, currency switcher + accounts count on the other side.
            Wraps to its own line on narrow screens instead of squeezing everything into one row. */}
        <div className="relative flex flex-wrap items-center justify-between gap-y-2 gap-x-3">
          <span className="text-sm font-medium text-white/80">{label}</span>

          <div className="flex flex-wrap items-center gap-2">
            {currencies.length > 1 && (
              <div
                role="group"
                aria-label={t("dashboard.summary.currency")}
                onClick={(event) => event.stopPropagation()}
                className="inline-flex rounded-full bg-white/10 p-1"
              >
                {currencies.map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => onCurrencyChange?.(code)}
                    aria-pressed={code === currency}
                    title={currencyName(code)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                      code === currency ? "bg-white text-brand-700" : "text-white/70 hover:text-white"
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>
            )}

            {Number.isFinite(accountsCount) && accountsCount > 0 && (
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-white/70">
                <Wallet size={13} />
                {t("dashboard.wealth.accounts", { count: accountsCount })}
              </span>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className="relative">
          <span className="tabular-amount block text-3xl font-extrabold tracking-tight sm:text-4xl">
            {formatMoney(amount, currency)}
          </span>
        </div>

        {/* Period income / expenses / net + trend bars */}
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          {showPeriod && (
            <div className="min-w-0 flex-1">
              {periodLabel && <p className="mb-2 text-sm font-semibold text-white/80">{periodLabel}</p>}
              <div className="grid grid-cols-3 gap-3 sm:flex sm:flex-wrap sm:gap-0">
                {stats.map(({ key, icon: Icon, tone, label: statLabel, value }, index) => (
                  <div
                    key={key}
                    className={`min-w-0 ${index > 0 ? "sm:border-s sm:border-white/15 sm:ps-5 sm:ms-5" : ""}`}
                  >
                    <div className="flex min-w-0 items-center gap-1 text-white/60">
                      <Icon size={11} strokeWidth={2.5} className={`shrink-0 rtl:-scale-x-100 ${tone}`} />
                      <span className="truncate text-[10px] font-medium sm:text-[11px]">{statLabel}</span>
                    </div>
                    <div className="mt-0.5 min-w-0">
                      <span className={`tabular-amount block truncate text-sm font-bold sm:text-base ${tone}`} dir="ltr">
                        {key === "net" && value > 0 ? "+" : ""}
                        {formatMoney(value || 0, currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {trendData.length > 0 && (
            <div className="ms-auto hidden flex-col items-end gap-1.5 sm:flex">
              <span className="text-[10px] font-medium text-white/45">{t("dashboard.wealth.trend")}</span>
              <div aria-hidden="true" className="flex h-14 w-40 items-end justify-end gap-1">
                {trendData.map((value, index) => {
                  const heightPct = Math.max((value / maxTrendValue) * 100, 8);
                  return (
                    <div
                      key={index}
                      className="w-1.5 rounded-full bg-brand-400/60 transition-all duration-500 ease-out"
                      style={{
                        height: grown ? `${heightPct}%` : "0%",
                        transitionDelay: `${150 + index * 40}ms`,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TotalWealthCard;
