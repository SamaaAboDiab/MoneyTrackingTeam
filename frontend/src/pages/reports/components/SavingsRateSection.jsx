import { useTranslation } from "react-i18next";
import { formatMoney, formatPercent } from "../../../utils/formatAmount";
import { monthLabel } from "../labels";
import { ReportSkeleton } from "../../../components/common/Skeleton";

function SavingsRateSection({ data, loading }) {
  const { t } = useTranslation();
  if (loading) return <ReportSkeleton label={t("reports.loading")} />;
  if (!data) return null;

  const { monthly = [], avgRate = 0, avgSavings = 0, targetRate = 20 } = data;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm shadow-slate-200 ring-1 ring-slate-100">
          <p className="text-xs font-semibold text-slate-400">{t("reports.savingsRate.avgRate")}</p>
          <p className={`tabular-amount mt-2 text-xl font-extrabold ${avgRate >= targetRate ? "text-income" : "text-slate-900"}`}>{formatPercent(avgRate, 1)}</p>
          <p className="mt-1 text-xs text-slate-400">{t("reports.savingsRate.targetNote", { rate: formatPercent(targetRate) })}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm shadow-slate-200 ring-1 ring-slate-100">
          <p className="text-xs font-semibold text-slate-400">{t("reports.savingsRate.avgSavings")}</p>
          <p className="tabular-amount mt-2 text-xl font-extrabold text-slate-900">{formatMoney(avgSavings)}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100">
        <h3 className="text-base font-bold text-slate-900">{t("reports.savingsRate.monthlyTitle")}</h3>
        {monthly.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">{t("reports.empty")}</p>
        ) : (
          <div className="mt-4 space-y-3">
            {monthly.map((m) => (
              <div key={m.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">{monthLabel(m.label)}</span>
                  <span className={`tabular-amount font-bold ${m.rate >= 0 ? "text-income" : "text-expense"}`}>
                    {formatPercent(m.rate, 1)} · {formatMoney(m.savings)}
                  </span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${m.rate >= 0 ? "bg-income" : "bg-expense"}`}
                    style={{ width: `${Math.min(100, Math.max(0, Math.abs(m.rate)))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SavingsRateSection;
