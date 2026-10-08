import { useTranslation } from "react-i18next";
import { formatAmount, formatMoney, formatDate } from "../../../utils/formatAmount";
import { ReportSkeleton } from "../../../components/common/Skeleton";

function CashFlowSection({ data, loading }) {
  const { t } = useTranslation();
  if (loading) return <ReportSkeleton label={t("reports.loading")} />;
  if (!data) return null;

  const { timeline = [], totalIn = 0, totalOut = 0, netFlow = 0 } = data;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold text-slate-500">{t("reports.cashFlow.totalIn")}</p>
          <p className="tabular-amount mt-1.5 text-2xl font-extrabold text-slate-900">{formatMoney(totalIn)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold text-slate-500">{t("reports.cashFlow.totalOut")}</p>
          <p className="tabular-amount mt-1.5 text-2xl font-extrabold text-slate-900">{formatMoney(totalOut)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold text-slate-500">{t("reports.cashFlow.netFlow")}</p>
          <p className={`tabular-amount mt-1.5 text-2xl font-extrabold ${netFlow >= 0 ? "text-income" : "text-expense"}`}>
            {formatMoney(netFlow)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
        <h3 className="text-base font-bold text-slate-900">{t("reports.cashFlow.timelineTitle")}</h3>
        {timeline.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">{t("reports.empty")}</p>
        ) : (
          <div className="mt-4 max-h-96 space-y-2 overflow-y-auto">
            {timeline.slice().reverse().map((item) => (
              <div key={item._id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-700">{item.name}</p>
                  <p className="text-xs text-slate-400">{formatDate(item.date, { month: "short", day: "numeric" })}</p>
                </div>
                <div className="text-end">
                  <p className={`tabular-amount font-bold ${item.type === "income" ? "text-income" : "text-expense"}`}>
                    {formatAmount(item.type === "income" ? Math.abs(item.amount) : -Math.abs(item.amount), { signDisplay: "exceptZero" })}
                  </p>
                  <p className="tabular-amount text-xs text-slate-400">{t("reports.cashFlow.runningBalance")}: {formatAmount(item.runningBalance)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CashFlowSection;
