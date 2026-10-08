import { useTranslation } from "react-i18next";
import { ArrowUp, ArrowDown } from "lucide-react";
import { formatMoney, formatPercent } from "../../../utils/formatAmount";
import { monthLabel } from "../labels";
import { ReportSkeleton } from "../../../components/common/Skeleton";

function NetWorthSection({ data, loading }) {
  const { t } = useTranslation();
  if (loading) return <ReportSkeleton label={t("reports.loading")} />;
  if (!data) return null;

  const { monthly = [], currentNetWorth = 0, change = 0, changePct } = data;
  const isUp = change >= 0;
  const maxValue = Math.max(...monthly.map((m) => Math.abs(m.netWorth)), 1);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-brand-600 p-6 text-white sm:p-8">
        <p className="text-sm font-medium text-white/80">{t("reports.netWorth.current")}</p>
        <p className="tabular-amount mt-2 text-3xl font-extrabold">{formatMoney(currentNetWorth)}</p>
        <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${isUp ? "bg-income" : "bg-expense"}`}>
          {isUp ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
          {formatMoney(Math.abs(change))}
          {changePct !== null && changePct !== undefined && <span>({formatPercent(changePct, 1)})</span>}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
        <h3 className="text-base font-bold text-slate-900">{t("reports.netWorth.historyTitle")}</h3>
        {monthly.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">{t("reports.empty")}</p>
        ) : (
          <div className="mt-6 flex items-end gap-3 overflow-x-auto pb-2">
            {monthly.map((m) => (
              <div key={m.label} className="flex shrink-0 flex-col items-center gap-1" style={{ width: 56 }}>
                <div className="flex h-36 w-full items-end justify-center">
                  <div
                    className={`w-6 rounded-t-md ${m.netWorth >= 0 ? "bg-brand-600" : "bg-expense"}`}
                    style={{ height: `${Math.max((Math.abs(m.netWorth) / maxValue) * 100, 2)}%` }}
                    title={formatMoney(m.netWorth)}
                  />
                </div>
                <span className="text-[11px] font-medium text-slate-400">{monthLabel(m.label)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NetWorthSection;
