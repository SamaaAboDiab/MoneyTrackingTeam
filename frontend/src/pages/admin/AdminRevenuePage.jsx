import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BarChart3, CalendarRange, ClipboardCheck, Info, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import { fetchRevenueReport } from "../../api/adminExtrasApi";
import { formatMoney } from "../../utils/formatAmount";
import { toIntlLocale } from "../../i18n/locale";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BAR_CURSOR, BAR_RADIUS, CHART_COLORS, GRID_PROPS, useChartLayout } from "../../components/charts/chartTheme";
import ChartTooltip from "../../components/charts/ChartTooltip";

const card = "rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6";

// Revenue per month (paid plans by the month they started) and what upcoming renewals could bring.
function AdminRevenuePage() {
  const { t, i18n } = useTranslation();
  const [report, setReport] = useState(null);
  const [status, setStatus] = useState("loading");
  const locale = toIntlLocale(i18n.language);
  const monthFormat = new Intl.DateTimeFormat(locale, { month: "short" });
  const longMonthFormat = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });
  const numberFormat = new Intl.NumberFormat(locale);
  const { xAxisProps, yAxisProps, animate } = useChartLayout();

  const load = useCallback(async () => {
    try {
      const { data } = await fetchRevenueReport();
      setReport(data.data);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-6xl space-y-4" aria-hidden="true">
        <span className="skeleton block h-16 rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((item) => <span key={item} className="skeleton block h-28 rounded-3xl" />)}
        </div>
        <span className="skeleton block h-80 rounded-3xl" />
      </div>
    );
  }
  if (status === "error") {
    return <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">{t("admin.revenue.loadError")}</p>;
  }

  const money = (value) => formatMoney(value, report.currency);
  // One bar per month: short name on the axis, full name + count in the tooltip.
  const chartData = report.months.map((month) => {
    const date = new Date(month.y, month.m, 1);
    return { key: `${month.y}-${month.m}`, month: monthFormat.format(date), label: longMonthFormat.format(date), total: month.total, count: month.count };
  });
  const change = report.lastMonth ? Math.round(((report.thisMonth - report.lastMonth) / report.lastMonth) * 100) : null;
  const summary = [
    { key: "thisMonth", value: money(report.thisMonth), icon: Wallet, tone: "bg-emerald-50 text-emerald-600" },
    { key: "yearTotal", value: money(report.yearTotal), icon: BarChart3, tone: "bg-sky-50 text-sky-600" },
    { key: "monthlyAverage", value: money(report.monthlyAverage), icon: CalendarRange, tone: "bg-violet-50 text-violet-600" },
    { key: "pendingRenewals", value: money(report.pendingRenewals.total), icon: ClipboardCheck, tone: "bg-amber-50 text-amber-600", link: "/admin/renewals" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-8">
      <PageHeader icon={BarChart3} title={t("admin.revenue.title")} subtitle={t("admin.revenue.subtitle")} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {summary.map(({ key, value, icon: Icon, tone, link }) => {
          const content = (
            <>
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
                <Icon size={19} />
              </span>
              <p className="mt-3 text-xs font-semibold text-slate-500">{t(`admin.revenue.summary.${key}`)}</p>
              <p className="mt-1 text-xl font-extrabold tabular-nums text-slate-900">{value}</p>
              {key === "thisMonth" && change !== null && (
                <p className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${change >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {change >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  {t("admin.home.vsLastMonth", { value: `${change >= 0 ? "+" : ""}${numberFormat.format(change)}%` })}
                </p>
              )}
              {key === "pendingRenewals" && (
                <p className="mt-1 text-xs text-slate-500">{t("admin.revenue.requests", { count: report.pendingRenewals.count })}</p>
              )}
            </>
          );
          return link ? (
            <Link key={key} to={link} className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              {content}
            </Link>
          ) : (
            <div key={key} className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">{content}</div>
          );
        })}
      </div>

      {/* Revenue per month */}
      <section className={card}>
        <h2 className="text-base font-bold text-slate-900">{t("admin.revenue.monthlyTitle")}</h2>
        <p className="mt-0.5 flex items-start gap-1.5 text-xs text-slate-500">
          <Info size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
          {t("admin.revenue.basis")}
        </p>
        <div className="mt-6 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="month" {...xAxisProps} interval="preserveStartEnd" />
              <YAxis {...yAxisProps} allowDecimals={false} />
              <Tooltip
                cursor={BAR_CURSOR}
                content={
                  <ChartTooltip
                    showNames={false}
                    title={(_, payload) => payload[0]?.payload.label}
                    formatValue={(value) => money(value)}
                    footer={(payload) => t("admin.revenue.subscriptions", { count: payload[0]?.payload.count ?? 0 })}
                  />
                }
              />
              <Bar dataKey="total" fill={CHART_COLORS.income} radius={BAR_RADIUS} maxBarSize={36} minPointSize={2} isAnimationActive={animate}>
                {chartData.map((month) => (
                  <Cell key={month.key} fill={month.total > 0 ? CHART_COLORS.income : CHART_COLORS.empty} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* The same values for screen readers. */}
        <ul className="sr-only" aria-label={t("admin.revenue.monthlyTitle")}>
          {chartData.map((month) => (
            <li key={month.key}>
              {month.label}: {money(month.total)} · {t("admin.revenue.subscriptions", { count: month.count })}
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Forecast */}
        <section className={card}>
          <h2 className="text-base font-bold text-slate-900">{t("admin.revenue.forecastTitle")}</h2>
          <p className="mt-0.5 text-xs text-slate-500">{t("admin.revenue.forecastBasis")}</p>
          <ul className="mt-5 space-y-3">
            {report.forecast.map((row) => (
              <li key={row.days} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-slate-800">{t("admin.revenue.nextDays", { days: row.days })}</p>
                  <p className="text-xs text-slate-500">{t("admin.revenue.subscriptions", { count: row.count })}</p>
                </div>
                <p className="text-lg font-extrabold tabular-nums text-emerald-700">{money(row.total)}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Prices */}
        <section className={card}>
          <h2 className="text-base font-bold text-slate-900">{t("admin.revenue.pricesTitle")}</h2>
          <p className="mt-0.5 text-xs text-slate-500">{t("admin.revenue.pricesNote")}</p>
          <ul className="mt-5 space-y-3">
            {["3months", "6months", "yearly"].map((plan) => (
              <li key={plan} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 px-4 py-3">
                <span className="text-sm font-semibold text-slate-700">{t(`admin.home.plans.${plan}`)}</span>
                <span className="font-bold tabular-nums text-slate-900">{money(report.prices[plan])}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default AdminRevenuePage;
