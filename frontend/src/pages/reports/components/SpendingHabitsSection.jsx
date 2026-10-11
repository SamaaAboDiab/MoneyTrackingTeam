import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import { formatAmount, formatDate, formatMoney, formatPercent } from "../../../utils/formatAmount";
import ReportStatCard from "./ReportStatCard";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartTooltip from "../../../components/charts/ChartTooltip";
import { BAR_CURSOR, BAR_RADIUS, CHART_COLORS, GRID_PROPS, useChartLayout } from "../../../components/charts/chartTheme";
import { categoryLabel } from "../../categories/components/mandatoryCategories";
import { weekdayLabel } from "../labels";
import { ReportSkeleton } from "../../../components/common/Skeleton";

function SpendingHabitsSection({ data, loading }) {
  const { t } = useTranslation();
  const { xAxisProps, yAxisProps, animate } = useChartLayout();
  if (loading) return <ReportSkeleton label={t("reports.loading")} />;
  if (!data) return null;

  const { topCategories = [], topExpenses = [], byDayOfWeek = [], weekdayTotal = 0, weekendTotal = 0, alerts = [] } = data;
  const chartData = byDayOfWeek.map((d) => ({
    day: weekdayLabel(d.day),
    total: d.total,
    fill: d.isWeekend ? CHART_COLORS.weekend : CHART_COLORS.brand,
  }));

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
        <ReportStatCard label={t("reports.habits.weekdayTotal")} amount={weekdayTotal} />
        <ReportStatCard label={t("reports.habits.weekendTotal")} amount={weekendTotal} />
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100 emerald:ring-slate-200/80">
        <h3 className="text-base font-bold text-slate-900">{t("reports.habits.byDayTitle")}</h3>
        {byDayOfWeek.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">{t("reports.empty")}</p>
        ) : (
          <>
            <div className="mt-6 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                  <CartesianGrid {...GRID_PROPS} />
                  <XAxis dataKey="day" {...xAxisProps} />
                  <YAxis {...yAxisProps} />
                  <Tooltip
                    cursor={BAR_CURSOR}
                    content={<ChartTooltip showNames={false} title={(label) => label} formatValue={(value) => formatMoney(value)} />}
                  />
                  <Bar dataKey="total" radius={BAR_RADIUS} maxBarSize={32} isAnimationActive={animate}>
                    {chartData.map((d) => (
                      <Cell key={d.day} fill={d.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Two colors on one series: name what each means. */}
            <div className="mt-3 flex items-center gap-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: CHART_COLORS.brand }} />{t("reports.habits.weekdayTotal")}</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: CHART_COLORS.weekend }} />{t("reports.habits.weekendTotal")}</span>
            </div>
          </>
        )}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100 emerald:ring-slate-200/80">
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
        <div className="rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100 emerald:ring-slate-200/80">
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
