import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import { formatAmount, formatMoney, formatDate, formatPercent } from "../../../utils/formatAmount";
import { categoryLabel } from "../../categories/components/mandatoryCategories";
import { weekdayLabel } from "../labels";
import { ReportSkeleton } from "../../../components/common/Skeleton";

function SpendingHabitsSection({ data, loading }) {
  const { t } = useTranslation();
  if (loading) return <ReportSkeleton label={t("reports.loading")} />;
  if (!data) return null;

  const { topCategories = [], topExpenses = [], byDayOfWeek = [], weekdayTotal = 0, weekendTotal = 0, alerts = [] } = data;
  const maxDayTotal = Math.max(...byDayOfWeek.map((d) => d.total), 1);

  return (
    <div className="space-y-4">
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div key={alert.category} className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
              <AlertTriangle size={16} />
              {t("reports.habits.spikeAlert", { category: categoryLabel(alert.category), pct: formatPercent(alert.pctChange) })}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
          <p className="text-xs font-semibold text-slate-400">{t("reports.habits.weekdayTotal")}</p>
          <p className="tabular-amount mt-2 text-xl font-extrabold text-slate-900">{formatMoney(weekdayTotal)}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
          <p className="text-xs font-semibold text-slate-400">{t("reports.habits.weekendTotal")}</p>
          <p className="tabular-amount mt-2 text-xl font-extrabold text-slate-900">{formatMoney(weekendTotal)}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
        <h3 className="text-base font-bold text-slate-900">{t("reports.habits.byDayTitle")}</h3>
        {byDayOfWeek.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">{t("reports.empty")}</p>
        ) : (
          <div className="mt-6 flex items-end justify-between gap-2">
            {byDayOfWeek.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-28 w-full items-end justify-center">
                  <div
                    className={`w-6 rounded-t-md ${d.isWeekend ? "bg-amber-400" : "bg-brand-600"}`}
                    style={{ height: `${Math.max((d.total / maxDayTotal) * 100, 3)}%` }}
                    title={formatAmount(d.total)}
                  />
                </div>
                <span className="text-[11px] font-medium text-slate-400">{weekdayLabel(d.day)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
        <h3 className="text-base font-bold text-slate-900">{t("reports.habits.topExpensesTitle")}</h3>
        {topExpenses.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">{t("reports.empty")}</p>
        ) : (
          <div className="mt-4 space-y-2">
            {topExpenses.map((e) => (
              <div key={e._id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-700">{e.description}</p>
                  <p className="text-xs text-slate-400">{categoryLabel(e.categoryName)} · {formatDate(e.date, { month: "short", day: "numeric" })}</p>
                </div>
                <span className="tabular-amount font-bold text-expense">{formatAmount(e.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {topCategories.length > 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
          <h3 className="text-base font-bold text-slate-900">{t("reports.habits.topCategoriesTitle")}</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {topCategories.map((cat) => (
              <span key={cat.id} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                {categoryLabel(cat.name)} · {formatAmount(cat.total)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SpendingHabitsSection;
