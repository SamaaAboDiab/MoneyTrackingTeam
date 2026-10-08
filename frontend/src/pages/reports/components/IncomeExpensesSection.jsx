import { useTranslation } from "react-i18next";
import { TrendingUp, TrendingDown, Wallet, Target } from "lucide-react";
import { formatAmount, formatMoney } from "../../../utils/formatAmount";
import { monthLabel } from "../labels";
import { ReportSkeleton } from "../../../components/common/Skeleton";

function IncomeExpensesSection({ data, loading }) {
  const { t } = useTranslation();
  if (loading) return <ReportSkeleton label={t("reports.loading")} />;
  if (!data) return null;

  const { monthly = [], avgExpenses = 0, totalIncome = 0, totalExpenses = 0 } = data;
  const netSavings = totalIncome - totalExpenses;
  const maxValue = Math.max(...monthly.flatMap((m) => [m.income, m.expenses]), 1);

  const STATS = [
    { icon: TrendingDown, label: t("reports.incomeExpenses.avgExpenses"), value: avgExpenses, color: "text-expense" },
    { icon: Target, label: t("reports.incomeExpenses.netSavings"), value: netSavings, color: netSavings >= 0 ? "text-income" : "text-expense" },
    { icon: TrendingDown, label: t("reports.incomeExpenses.totalExpenses"), value: totalExpenses, color: "text-expense" },
    { icon: TrendingUp, label: t("reports.incomeExpenses.totalIncome"), value: totalIncome, color: "text-income" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
            <div className="flex items-center gap-2 text-slate-400">
              <Icon size={15} />
              <span className="text-xs font-semibold">{label}</span>
            </div>
            <p className={`tabular-amount mt-2 text-xl font-extrabold ${color}`}>{formatMoney(value)}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
        <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
          <Wallet size={17} className="text-brand-600" />
          {t("reports.incomeExpenses.chartTitle")}
        </h3>
        {monthly.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">{t("reports.empty")}</p>
        ) : (
          <div className="mt-6 flex items-end gap-3 overflow-x-auto pb-2" style={{ minHeight: 180 }}>
            {monthly.map((m) => (
              <div key={m.label} className="flex shrink-0 flex-col items-center gap-1" style={{ width: 56 }}>
                <div className="flex h-36 items-end gap-1">
                  <div
                    className="w-4 rounded-t-md bg-income"
                    style={{ height: `${Math.max((m.income / maxValue) * 100, 2)}%` }}
                    title={`${t("reports.incomeExpenses.totalIncome")}: ${formatAmount(m.income)}`}
                  />
                  <div
                    className="w-4 rounded-t-md bg-expense"
                    style={{ height: `${Math.max((m.expenses / maxValue) * 100, 2)}%` }}
                    title={`${t("reports.incomeExpenses.totalExpenses")}: ${formatAmount(m.expenses)}`}
                  />
                </div>
                <span className="text-[11px] font-medium text-slate-400">{monthLabel(m.label)}</span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-3 flex items-center gap-4 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-income" />{t("reports.incomeExpenses.totalIncome")}</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-expense" />{t("reports.incomeExpenses.totalExpenses")}</span>
        </div>
      </div>
    </div>
  );
}

export default IncomeExpensesSection;
