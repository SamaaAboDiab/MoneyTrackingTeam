import { useTranslation } from "react-i18next";
import { formatAmount, formatMoney, formatPercent } from "../../../utils/formatAmount";
import { monthYearLabel } from "../labels";
import { ReportSkeleton } from "../../../components/common/Skeleton";

function DebtProgressSection({ data, loading }) {
  const { t } = useTranslation();
  if (loading) return <ReportSkeleton label={t("reports.loading")} />;
  if (!data) return null;

  const { debts = [], totalPaid = 0, totalRemaining = 0 } = data;

  if (debts.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200/80">
        <p className="text-sm text-slate-500">{t("reports.empty")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold text-slate-500">{t("reports.debtProgress.totalPaid")}</p>
          <p className="tabular-amount mt-1.5 text-2xl font-extrabold text-income">{formatMoney(totalPaid)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold text-slate-500">{t("reports.debtProgress.totalRemaining")}</p>
          <p className="tabular-amount mt-1.5 text-2xl font-extrabold text-expense">{formatMoney(totalRemaining)}</p>
        </div>
      </div>

      <div className="space-y-3">
        {debts.map((debt) => (
          <div key={debt._id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">{debt.creditor}</h3>
              <span className="tabular-amount text-sm font-semibold text-slate-500">
                {formatAmount(debt.paidAmount)} / {formatMoney(debt.totalAmount, debt.currency)}
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-brand-600" style={{ width: `${debt.progressPct}%` }} />
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <span>{formatPercent(debt.progressPct)}</span>
              {debt.estPayoff && <span>{t("reports.debtProgress.estPayoff")}: {monthYearLabel(debt.estPayoff)}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DebtProgressSection;
