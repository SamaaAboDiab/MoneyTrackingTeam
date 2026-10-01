import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, ArrowUpRight, ArrowDownRight, Wallet, Scale } from "lucide-react";
import { formatMoney } from "../../utils/formatAmount";

// Shows a value, or the mask when amounts are hidden (both kept in the layout so nothing jumps).
function Masked({ hidden, masked, children, className = "" }) {
  return (
    <span className={`relative inline-grid ${className}`}>
      <span className={`col-start-1 row-start-1 transition-opacity duration-200 ${hidden ? "opacity-0" : "opacity-100"}`} aria-hidden={hidden}>
        {children}
      </span>
      <span
        className={`col-start-1 row-start-1 tracking-widest transition-opacity duration-200 ${hidden ? "opacity-100" : "opacity-0"}`}
        aria-hidden={!hidden}
      >
        {masked}
      </span>
    </span>
  );
}

function TotalWealthCard({
  label,
  amount,
  currency,
  onOpenAccounts,
  trendData = [],
  maskedText = "••••••",
  showAriaLabel,
  hideAriaLabel,
  accountsCount,
  periodIncome,
  periodExpenses,
  periodLabel,
}) {
  const { t } = useTranslation();
  const [hidden, setHidden] = useState(false);
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const maxTrendValue = trendData.length ? Math.max(...trendData, 1) : 0;
  const showPeriod = Number.isFinite(periodIncome) || Number.isFinite(periodExpenses);
  const net = Number(periodIncome || 0) - Number(periodExpenses || 0);

  const stats = [
    { key: "income", icon: ArrowUpRight, tone: "bg-income/90", label: t("dashboard.summary.income"), value: periodIncome },
    { key: "expenses", icon: ArrowDownRight, tone: "bg-expense/90", label: t("dashboard.summary.expenses"), value: periodExpenses },
    { key: "net", icon: Scale, tone: net >= 0 ? "bg-white/25" : "bg-expense/90", label: t("dashboard.wealth.net"), value: net, desktopOnly: true },
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
        className={`relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-3xl bg-brand-600 p-6 text-white transition-all duration-300 ease-out sm:p-7 ${
          grown ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Decorative rings, purely visual */}
        <span aria-hidden="true" className="pointer-events-none absolute -top-24 -end-16 h-64 w-64 rounded-full border-[28px] border-white/[0.04]" />
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-28 end-40 h-56 w-56 rounded-full bg-white/[0.03]" />

        {/* Top row: label + visibility toggle together, accounts count on the other side */}
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white/80">{label}</span>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setHidden((prev) => !prev);
              }}
              aria-label={hidden ? showAriaLabel : hideAriaLabel}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
            >
              {hidden ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {Number.isFinite(accountsCount) && accountsCount > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/85">
              <Wallet size={13} />
              {t("dashboard.wealth.accounts", { count: accountsCount })}
            </span>
          )}
        </div>

        {/* Amount */}
        <div className="relative">
          <Masked hidden={hidden} masked={maskedText} className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            <span className="tabular-amount">{formatMoney(amount, currency)}</span>
          </Masked>
        </div>

        {/* Period income / expenses + trend bars */}
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          {showPeriod && (
            <div className="min-w-0">
              {periodLabel && <p className="mb-2 text-xs font-medium text-white/60">{periodLabel}</p>}
              <div className="flex flex-wrap gap-2">
                {stats.map(({ key, icon: Icon, tone, label: statLabel, value, desktopOnly }) => (
                  <div
                    key={key}
                    className={`items-center gap-2.5 rounded-2xl bg-white/10 py-2 pe-3.5 ps-2 ${desktopOnly ? "hidden lg:flex" : "flex"}`}
                  >
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${tone}`}>
                      <Icon size={15} strokeWidth={2.5} className="rtl:-scale-x-100" />
                    </span>
                    <span className="flex flex-col leading-tight">
                      <span className="text-[11px] font-medium text-white/65">{statLabel}</span>
                      <Masked hidden={hidden} masked="•••" className="text-sm font-bold">
                        <span className="tabular-amount" dir="ltr">
                          {key === "net" && value > 0 ? "+" : ""}
                          {formatMoney(value || 0, currency)}
                        </span>
                      </Masked>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {trendData.length > 0 && (
            <div aria-hidden="true" className="ms-auto hidden h-14 w-40 items-end justify-end gap-1 sm:flex">
              {trendData.map((value, index) => {
                const heightPct = Math.max((value / maxTrendValue) * 100, 8);
                return (
                  <div
                    key={index}
                    className="w-1.5 rounded-full bg-white/30 transition-all duration-500 ease-out"
                    style={{
                      height: grown ? `${heightPct}%` : "0%",
                      transitionDelay: `${150 + index * 40}ms`,
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TotalWealthCard;
