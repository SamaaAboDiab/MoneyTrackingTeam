import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BarChart3, CalendarRange, ClipboardCheck, Info, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import { fetchRevenueReport } from "../../api/adminExtrasApi";
import { formatMoney } from "../../utils/formatAmount";
import { toIntlLocale } from "../../i18n/locale";

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
  const max = Math.max(1, ...report.months.map((month) => month.total));
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
        <ul className="mt-6 grid h-64 grid-flow-col auto-cols-fr items-end gap-1.5 sm:gap-3">
          {report.months.map((month) => {
            const date = new Date(month.y, month.m, 1);
            const height = month.total > 0 ? Math.max((month.total / max) * 100, 5) : 2;
            return (
              <li key={`${month.y}-${month.m}`} className="group flex h-full min-w-0 flex-col items-center justify-end gap-2">
                <span className="text-[10px] font-bold tabular-nums text-slate-500 opacity-0 transition group-hover:opacity-100 sm:text-[11px]">
                  {month.total ? numberFormat.format(month.total) : ""}
                </span>
                <span
                  title={`${longMonthFormat.format(date)}: ${money(month.total)} · ${t("admin.revenue.subscriptions", { count: month.count })}`}
                  className={`w-full max-w-10 rounded-t-lg transition-[height] duration-700 ${
                    month.total > 0 ? "bg-linear-to-t from-emerald-500 to-emerald-300 group-hover:from-emerald-600" : "bg-slate-100"
                  }`}
                  style={{ height: `${height}%` }}
                />
                <span className="w-full truncate text-center text-[11px] text-slate-400">{monthFormat.format(date)}</span>
              </li>
            );
          })}
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
