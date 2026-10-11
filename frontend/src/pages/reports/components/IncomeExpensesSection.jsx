import { useTranslation } from "react-i18next";
import { TrendingUp, TrendingDown, Wallet, Target } from "lucide-react";
import { formatMoney } from "../../../utils/formatAmount";
import { monthLabel } from "../labels";
import { ReportSkeleton } from "../../../components/common/Skeleton";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartTooltip from "../../../components/charts/ChartTooltip";
import { BAR_CURSOR, BAR_RADIUS, CHART_COLORS, GRID_PROPS, useChartLayout } from "../../../components/charts/chartTheme";

function IncomeExpensesSection({ data, loading }) {
  const { t } = useTranslation();
  const { xAxisProps, yAxisProps, animate } = useChartLayout();
  if (loading) return <ReportSkeleton label={t("reports.loading")} />;
  if (!data) return null;

  const { monthly = [], avgExpenses = 0, totalIncome = 0, totalExpenses = 0 } = data;
  const netSavings = totalIncome - totalExpenses;
  const chartData = monthly.map((m) => ({ month: monthLabel(m.label), income: m.income, expenses: m.expenses }));

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
          <div key={label} className="card-hover rounded-2xl bg-white p-5 ring-1 ring-slate-100 emerald:ring-slate-200/80">
            <div className="flex items-center gap-2 text-slate-400">
              <Icon size={15} />
              <span className="text-xs font-semibold">{label}</span>
            </div>
            <p className={`tabular-amount mt-2 text-xl font-extrabold ${color}`}>{formatMoney(value)}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100 emerald:ring-slate-200/80">
        <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
          <Wallet size={17} className="text-brand-600" />
          {t("reports.incomeExpenses.chartTitle")}
        </h3>
        {monthly.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">{t("reports.empty")}</p>
        ) : (
          <div className="mt-6 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={2} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="month" {...xAxisProps} />
                <YAxis {...yAxisProps} />
                <Tooltip
                  cursor={BAR_CURSOR}
                  content={<ChartTooltip title={(label) => label} formatValue={(value) => formatMoney(value)} />}
                />
                <Bar
                  dataKey="income"
                  name={t("reports.incomeExpenses.totalIncome")}
                  fill={CHART_COLORS.income}
                  radius={BAR_RADIUS}
                  maxBarSize={22}
                  isAnimationActive={animate}
                />
                <Bar
                  dataKey="expenses"
                  name={t("reports.incomeExpenses.totalExpenses")}
                  fill={CHART_COLORS.expense}
                  radius={BAR_RADIUS}
                  maxBarSize={22}
                  isAnimationActive={animate}
                />
              </BarChart>
            </ResponsiveContainer>
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
