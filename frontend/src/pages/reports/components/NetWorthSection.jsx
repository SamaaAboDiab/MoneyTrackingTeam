import { useTranslation } from "react-i18next";
import { ArrowUp, ArrowDown } from "lucide-react";
import { formatMoney, formatPercent } from "../../../utils/formatAmount";
import { monthLabel } from "../labels";
import { ReportSkeleton } from "../../../components/common/Skeleton";
import ReportStatCard from "./ReportStatCard";
import { Bar, BarChart, CartesianGrid, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartTooltip from "../../../components/charts/ChartTooltip";
import { BAR_CURSOR, BAR_RADIUS, CHART_COLORS, GRID_PROPS, useChartLayout } from "../../../components/charts/chartTheme";

function NetWorthSection({ data, loading }) {
  const { t } = useTranslation();
  const { xAxisProps, yAxisProps, animate } = useChartLayout();
  if (loading) return <ReportSkeleton label={t("reports.loading")} />;
  if (!data) return null;

  const { monthly = [], currentNetWorth = 0, change = 0, changePct } = data;
  const isUp = change >= 0;
  // fill rides on each row so the tooltip's key matches the bar (brand, or red below zero).
  const chartData = monthly.map((m) => ({
    month: monthLabel(m.label),
    netWorth: m.netWorth,
    fill: m.netWorth >= 0 ? CHART_COLORS.brand : CHART_COLORS.expense,
  }));
  const hasNegative = chartData.some((m) => m.netWorth < 0);

  return (
    <div className="space-y-4">
      <ReportStatCard large label={t("reports.netWorth.current")} amount={currentNetWorth}>
        <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${isUp ? "bg-income" : "bg-expense"}`}>
          {isUp ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
          {formatMoney(Math.abs(change))}
          {changePct !== null && changePct !== undefined && <span>({formatPercent(changePct, 1)})</span>}
        </div>
      </ReportStatCard>

      <div className="rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100 emerald:ring-slate-200/80">
        <h3 className="text-base font-bold text-slate-900">{t("reports.netWorth.historyTitle")}</h3>
        {monthly.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">{t("reports.empty")}</p>
        ) : (
          <div className="mt-6 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="month" {...xAxisProps} />
                <YAxis {...yAxisProps} />
                {hasNegative && <ReferenceLine y={0} stroke="var(--color-slate-300, #cbd5e1)" />}
                <Tooltip
                  cursor={BAR_CURSOR}
                  content={<ChartTooltip showNames={false} title={(label) => label} formatValue={(value) => formatMoney(value)} />}
                />
                <Bar
                  dataKey="netWorth"
                  radius={BAR_RADIUS}
                  maxBarSize={32}
                  isAnimationActive={animate}
                >
                  {chartData.map((m) => (
                    <Cell key={m.month} fill={m.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

export default NetWorthSection;
