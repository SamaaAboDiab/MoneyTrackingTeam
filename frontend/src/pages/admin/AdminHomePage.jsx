import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Ban,
  ChartNoAxesColumn,
  Clock3,
  History,
  MessagesSquare,
  PieChart,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
  UserX,
  Wallet,
} from "lucide-react";
import { fetchAdminDashboard, fetchAdminStats } from "../../api/adminAuthApi";
import { formatMoney } from "../../utils/formatAmount";
import { toIntlLocale } from "../../i18n/locale";

const EMPTY_STATS = { total: 0, active: 0, expiring: 0, expired: 0, suspended: 0 };
const PLAN_TYPES = [
  { type: "trial", color: "#38bdf8" },
  { type: "3months", color: "#818cf8" },
  { type: "6months", color: "#34d399" },
  { type: "yearly", color: "#fbbf24" },
  { type: "custom", color: "#f472b6" },
];
const DONUT_SIZE = 184;
const DONUT_RADIUS = 72;
const DONUT_STROKE = 22;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

const cardClass = "rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6";

function CardTitle({ icon: Icon, tone, title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
          <Icon size={19} />
        </span>
        <div>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

function ErrorBox({ children }) {
  return <div role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">{children}</div>;
}

/* ── hero: greeting, quick links and two headline numbers ── */
function Hero({ admin, kpis, loading, t, language }) {
  const numberFormat = new Intl.NumberFormat(toIntlLocale(language));
  const growing = (kpis.totalMoM ?? 0) >= 0;
  const TrendIcon = growing ? TrendingUp : TrendingDown;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-navy-800 to-navy-900 p-5 text-white shadow-2xl sm:p-8">
      <span aria-hidden="true" className="absolute -top-20 h-56 w-56 rounded-full bg-brand-500/20 blur-3xl inset-e-0" />
      <span aria-hidden="true" className="absolute -bottom-24 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl inset-s-10" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-brand-300 ring-1 ring-white/10">
            <Sparkles size={13} />
            {t("admin.home.heroBadge")}
          </p>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
            {t("admin.home.welcome", { name: admin?.name ?? "" })}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">{t("admin.home.subtitle")}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              to="/admin/users"
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-500 sm:flex-none px-4 text-sm font-bold text-white shadow-sm transition hover:bg-brand-600"
            >
              <Users size={17} />
              {t("admin.home.usersLink")}
            </Link>
            <Link
              to="/admin/chat"
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl sm:flex-none bg-white/10 px-4 text-sm font-bold text-white ring-1 ring-white/15 transition hover:bg-white/15"
            >
              <MessagesSquare size={17} />
              {t("admin.home.chatLink")}
            </Link>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-3 lg:w-80">
          <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <dt className="text-xs text-slate-400">{t("admin.home.newThisMonth")}</dt>
            <dd className="mt-1 text-xl font-extrabold tabular-nums sm:text-2xl">{loading ? "…" : numberFormat.format(kpis.thisMonthNew ?? 0)}</dd>
            {!loading && (
              <dd className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${growing ? "text-emerald-300" : "text-rose-300"}`}>
                <TrendIcon size={13} />
                {t("admin.home.vsLastMonth", { value: `${growing ? "+" : ""}${numberFormat.format(kpis.totalMoM ?? 0)}%` })}
              </dd>
            )}
          </div>
          <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <dt className="text-xs text-slate-400">{t("admin.home.conversionRate")}</dt>
            <dd className="mt-1 text-xl font-extrabold tabular-nums sm:text-2xl">
              {loading ? "…" : `${numberFormat.format(kpis.conversionRate ?? 0)}%`}
            </dd>
            <dd className="mt-1 text-xs text-slate-400">{t("admin.home.conversionHint")}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

/* ── status cards: number + share of all users, each opens the filtered list ── */
function StatCards({ stats, loading, error, t, language }) {
  const numberFormat = new Intl.NumberFormat(toIntlLocale(language));
  const cards = [
    { key: "total", icon: Users, tone: "bg-sky-50 text-sky-600", bar: "bg-sky-400", link: "/admin/users" },
    { key: "active", icon: UserCheck, tone: "bg-emerald-50 text-emerald-600", bar: "bg-emerald-400", link: "/admin/users?status=active" },
    { key: "expiring", icon: Clock3, tone: "bg-amber-50 text-amber-600", bar: "bg-amber-400", link: "/admin/users?status=expiring" },
    { key: "expired", icon: UserX, tone: "bg-slate-100 text-slate-600", bar: "bg-slate-400", link: "/admin/users?status=expired" },
    { key: "suspended", icon: Ban, tone: "bg-rose-50 text-rose-600", bar: "bg-rose-400", link: "/admin/users?status=suspended" },
  ];

  if (error) return <ErrorBox>{error}</ErrorBox>;

  return (
    <section aria-label={t("admin.home.statsTitle")} className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {cards.map(({ key, icon: Icon, tone, bar, link }) => {
        const value = stats[key] ?? 0;
        const share = stats.total ? Math.round((value / stats.total) * 100) : 0;
        return (
          <Link
            key={key}
            to={link}
            className={`group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md ${
              key === "total" ? "col-span-2 md:col-span-1" : ""
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}>
                <Icon size={18} />
              </span>
              <ArrowLeft size={15} className="text-slate-300 transition group-hover:text-slate-500 ltr:rotate-180" />
            </div>
            <p className="mt-3 text-2xl font-extrabold tabular-nums text-slate-900" aria-live="polite">
              {loading ? "…" : numberFormat.format(value)}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">{t(`admin.home.stats.${key}`)}</p>
            {key !== "total" && (
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                <span className={`block h-full rounded-full ${bar} transition-[width] duration-700`} style={{ width: `${loading ? 0 : share}%` }} />
              </div>
            )}
          </Link>
        );
      })}
    </section>
  );
}

/* ── new users per month ── */
function UserGrowthChart({ monthly, loading, error, t, language }) {
  const [period, setPeriod] = useState(12);
  const numberFormat = new Intl.NumberFormat(toIntlLocale(language));
  const dateFormat = new Intl.DateTimeFormat(toIntlLocale(language), { month: "short" });
  const visibleMonths = monthly.slice(-period);
  const total = visibleMonths.reduce((sum, month) => sum + month.count, 0);
  const maxCount = Math.max(1, ...visibleMonths.map((month) => month.count));

  return (
    <section aria-labelledby="admin-user-growth-title" className={cardClass}>
      <CardTitle
        icon={ChartNoAxesColumn}
        tone="bg-brand-50 text-brand-600"
        title={<span id="admin-user-growth-title">{t("admin.home.userGrowthTitle")}</span>}
        subtitle={t("admin.home.userGrowthSubtitle")}
        action={
          <div role="radiogroup" aria-label={t("admin.home.userGrowthPeriod")} className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {[3, 6, 12].map((months) => (
              <button
                key={months}
                type="button"
                role="radio"
                aria-checked={period === months}
                onClick={() => setPeriod(months)}
                className={`min-h-8 rounded-lg px-3 text-xs font-bold transition ${
                  period === months ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t("admin.home.lastMonths", { months })}
              </button>
            ))}
          </div>
        }
      />

      {error ? (
        <ErrorBox>{error}</ErrorBox>
      ) : loading ? (
        <div role="status" className="mt-6">
          <span className="sr-only">{t("common.loading")}</span>
          <span aria-hidden="true" className="skeleton block h-60 rounded-2xl" />
        </div>
      ) : (
        <>
          <p className="mt-5 flex items-baseline gap-2">
            <strong className="text-3xl font-extrabold tabular-nums text-slate-900">{numberFormat.format(total)}</strong>
            <span className="text-sm text-slate-500">{t("admin.home.userGrowthTotal", { months: period })}</span>
          </p>
          <ul
            aria-label={t("admin.home.userGrowthChartLabel", { months: period })}
            className="mt-5 grid h-52 grid-flow-col auto-cols-fr items-end gap-1.5 sm:gap-2.5"
          >
            {visibleMonths.map((month) => {
              const date = new Date(month.year, month.month, 1);
              const monthLabel = dateFormat.format(date);
              const barHeight = month.count > 0 ? Math.max((month.count / maxCount) * 100, 6) : 3;
              return (
                <li key={`${month.year}-${month.month}`} className="group flex h-full min-w-0 flex-col items-center justify-end gap-2">
                  <span className="text-[11px] font-bold tabular-nums text-slate-500 opacity-0 transition group-hover:opacity-100">
                    {numberFormat.format(month.count)}
                  </span>
                  <span
                    aria-hidden="true"
                    title={t("admin.home.userGrowthMonthValue", { month: monthLabel, value: numberFormat.format(month.count) })}
                    className={`w-full max-w-9 rounded-t-lg transition-[height] duration-700 ${
                      month.count > 0 ? "bg-linear-to-t from-brand-500 to-brand-300 group-hover:from-brand-600" : "bg-slate-100"
                    }`}
                    style={{ height: `${barHeight}%` }}
                  />
                  <span className="w-full truncate text-center text-[11px] font-medium text-slate-400">{monthLabel}</span>
                  <span className="sr-only">
                    {t("admin.home.userGrowthMonthValue", { month: monthLabel, value: numberFormat.format(month.count) })}
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}

/* ── plan split (donut) ── */
function PlanDistributionChart({ plans, loading, error, t, language }) {
  const total = plans.reduce((sum, plan) => sum + plan.count, 0);
  const numberFormat = new Intl.NumberFormat(toIntlLocale(language));

  return (
    <section aria-labelledby="admin-plan-distribution-title" className={cardClass}>
      <CardTitle
        icon={PieChart}
        tone="bg-indigo-50 text-indigo-600"
        title={<span id="admin-plan-distribution-title">{t("admin.home.planDistributionTitle")}</span>}
        subtitle={t("admin.home.planDistributionSubtitle")}
      />

      {error ? (
        <ErrorBox>{error}</ErrorBox>
      ) : loading ? (
        <div role="status" className="mt-6 flex flex-col items-center gap-5">
          <span className="sr-only">{t("common.loading")}</span>
          <span aria-hidden="true" className="skeleton block h-[184px] w-[184px] rounded-full" />
          <span aria-hidden="true" className="skeleton block h-24 w-full rounded-xl" />
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-center gap-6">
          <div className="relative h-[184px] w-[184px] shrink-0">
            <svg
              viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
              role="img"
              aria-label={t("admin.home.planDistributionChartLabel", { total: numberFormat.format(total) })}
              className="h-full w-full -rotate-90"
            >
              <circle cx={DONUT_SIZE / 2} cy={DONUT_SIZE / 2} r={DONUT_RADIUS} fill="none" stroke="#f1f5f9" strokeWidth={DONUT_STROKE} />
              {plans.map((plan, index) => {
                const arcLength = total > 0 ? (plan.count / total) * DONUT_CIRCUMFERENCE : 0;
                const offset = plans
                  .slice(0, index)
                  .reduce((sum, previous) => sum + (total > 0 ? (previous.count / total) * DONUT_CIRCUMFERENCE : 0), 0);
                return (
                  <circle
                    key={plan.type}
                    cx={DONUT_SIZE / 2}
                    cy={DONUT_SIZE / 2}
                    r={DONUT_RADIUS}
                    fill="none"
                    stroke={plan.color}
                    strokeWidth={DONUT_STROKE}
                    strokeDasharray={`${arcLength} ${DONUT_CIRCUMFERENCE - arcLength}`}
                    strokeDashoffset={-offset}
                  >
                    <title>{`${t(`admin.home.plans.${plan.type}`)}: ${numberFormat.format(plan.count)} (${numberFormat.format(plan.percentage)}%)`}</title>
                  </circle>
                );
              })}
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <strong className="text-3xl font-extrabold tabular-nums text-slate-900">{numberFormat.format(total)}</strong>
              <span className="text-xs font-medium text-slate-500">{t("admin.home.planDistributionTotal")}</span>
            </div>
          </div>

          <ul className="grid w-full grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-1" aria-label={t("admin.home.planDistributionLegend")}>
            {plans.map((plan) => (
              <li key={plan.type} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 transition hover:bg-slate-50">
                <span className="flex min-w-0 items-center gap-2.5">
                  <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: plan.color }} />
                  <span className="truncate text-sm font-semibold text-slate-700">{t(`admin.home.plans.${plan.type}`)}</span>
                </span>
                <span className="shrink-0 text-sm tabular-nums text-slate-500">
                  <strong className="font-bold text-slate-900">{numberFormat.format(plan.count)}</strong>
                  <span className="ms-2 text-xs">{numberFormat.format(plan.percentage)}%</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/* ── revenue by plan ── */
function RevenueCard({ revenue, loading, error, t, language }) {
  const max = Math.max(1, ...revenue.byPlan.map((plan) => plan.revenue));
  const numberFormat = new Intl.NumberFormat(toIntlLocale(language));

  return (
    <section aria-labelledby="admin-revenue-title" className={cardClass}>
      <CardTitle
        icon={Wallet}
        tone="bg-emerald-50 text-emerald-600"
        title={<span id="admin-revenue-title">{t("admin.home.revenueTitle")}</span>}
        subtitle={t("admin.home.revenueBasis")}
      />
      {error ? (
        <ErrorBox>{error}</ErrorBox>
      ) : loading ? (
        <div className="mt-5 space-y-3" aria-hidden="true">
          <span className="skeleton block h-10 w-1/2 rounded-xl" />
          {[0, 1, 2].map((item) => <span key={item} className="skeleton block h-8 rounded-lg" />)}
        </div>
      ) : (
        <>
          <p className="mt-5 text-3xl font-extrabold tabular-nums text-slate-900">{formatMoney(revenue.total, revenue.currency)}</p>
          <ul className="mt-5 space-y-3">
            {revenue.byPlan.map((plan) => (
              <li key={plan.type}>
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="font-semibold text-slate-700">{t(`admin.home.plans.${plan.type}`)}</span>
                  <span className="tabular-nums font-bold text-slate-900">{formatMoney(plan.revenue, revenue.currency)}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                    <span
                      className="block h-full rounded-full transition-[width] duration-700"
                      style={{ width: `${(plan.revenue / max) * 100}%`, backgroundColor: PLAN_TYPES.find((p) => p.type === plan.type)?.color }}
                    />
                  </div>
                  <span className="shrink-0 text-[11px] text-slate-400">
                    {numberFormat.format(plan.count)} × {formatMoney(plan.price, revenue.currency)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

/* ── subscriptions ending soon ── */
function ExpiringUsersList({ users, total, loading, error, t, language }) {
  const numberFormat = new Intl.NumberFormat(toIntlLocale(language));
  const dateFormat = new Intl.DateTimeFormat(toIntlLocale(language), { month: "short", day: "numeric" });

  return (
    <section aria-labelledby="admin-expiring-users-title" className={cardClass}>
      <CardTitle
        icon={Clock3}
        tone="bg-amber-50 text-amber-600"
        title={<span id="admin-expiring-users-title">{t("admin.home.expiringUsersTitle")}</span>}
        subtitle={t("admin.home.expiringUsersSubtitle")}
        action={
          total > 0 && (
            <Link to="/admin/users?status=expiring" className="text-xs font-bold text-brand-700 underline underline-offset-4 hover:text-brand-800">
              {t("admin.home.viewAll")}
            </Link>
          )
        }
      />

      {error ? (
        <ErrorBox>{error}</ErrorBox>
      ) : loading ? (
        <div role="status" className="mt-5 space-y-2">
          <span className="sr-only">{t("common.loading")}</span>
          {[0, 1, 2].map((item) => <span key={item} aria-hidden="true" className="skeleton block h-14 rounded-xl" />)}
        </div>
      ) : users.length === 0 ? (
        <p className="mt-5 rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">{t("admin.home.noExpiringUsers")}</p>
      ) : (
        <ul className="mt-4 space-y-1">
          {users.slice(0, 5).map((user) => (
            <li key={user._id}>
              <Link
                to={`/admin/users?search=${encodeURIComponent(user.email)}&status=expiring`}
                className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-amber-50/60"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">
                  {(user.name || user.email || "?").trim()[0]?.toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-900">{user.name}</span>
                  <span className="block truncate text-xs text-slate-500">
                    {t(`admin.home.plans.${user.subscriptionType}`, { defaultValue: user.subscriptionType })}
                    {" · "}
                    {dateFormat.format(new Date(user.subscriptionEnd))}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-800">
                  {t("admin.home.daysRemaining", { days: numberFormat.format(user.daysLeft) })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ── latest admin actions ── */
function RecentActivity({ logs, loading, error, t, language }) {
  const timeFormat = new Intl.DateTimeFormat(toIntlLocale(language), { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  return (
    <section aria-labelledby="admin-recent-activity-title" className={cardClass}>
      <CardTitle
        icon={History}
        tone="bg-slate-100 text-slate-700"
        title={<span id="admin-recent-activity-title">{t("admin.home.recentActivityTitle")}</span>}
        subtitle={t("admin.home.recentActivitySubtitle")}
        action={
          <Link to="/admin/logs" className="text-xs font-bold text-brand-700 underline underline-offset-4 hover:text-brand-800">
            {t("admin.home.viewAll")}
          </Link>
        }
      />
      {error ? (
        <ErrorBox>{error}</ErrorBox>
      ) : loading ? (
        <div className="mt-5 space-y-2" aria-hidden="true">
          {[0, 1, 2].map((item) => <span key={item} className="skeleton block h-12 rounded-xl" />)}
        </div>
      ) : logs.length === 0 ? (
        <p className="mt-5 rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">{t("admin.auditLogs.empty")}</p>
      ) : (
        <ol className="mt-4 space-y-3">
          {logs.slice(0, 5).map((log) => (
            <li key={log._id} className="flex gap-3">
              <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-400 ring-4 ring-brand-50" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-700">
                  <span className="font-semibold text-slate-900">{t(`admin.auditLogs.actions.${log.action}`, { defaultValue: log.action })}</span>
                  {" · "}
                  <span className="text-slate-600">{log.userName}</span>
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {log.adminName} · {timeFormat.format(new Date(log.createdAt))}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function AdminHomePage() {
  const { t, i18n } = useTranslation();
  const { admin } = useSelector((state) => state.adminAuth);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [request, setRequest] = useState({ status: "loading", error: "" });
  const [plans, setPlans] = useState([]);
  const [revenue, setRevenue] = useState({ currency: "EGP", total: 0, byPlan: [] });
  const [monthly, setMonthly] = useState([]);
  const [kpis, setKpis] = useState({});
  const [recentLogs, setRecentLogs] = useState([]);
  const [expiringUsers, setExpiringUsers] = useState([]);
  const [expiringUsersTotal, setExpiringUsersTotal] = useState(0);
  const [dashboardRequest, setDashboardRequest] = useState({ status: "loading", error: "" });

  const loadStats = useCallback(async (signal) => {
    try {
      const { data } = await fetchAdminStats({ signal });
      setStats({ ...EMPTY_STATS, ...data.data });
      setRequest({ status: "succeeded", error: "" });
    } catch (error) {
      if (signal?.aborted) return;
      setRequest({
        status: "failed",
        error: error.response?.data?.message ?? t("admin.home.statsError"),
      });
    }
  }, [t]);

  const loadDashboard = useCallback(async (signal) => {
    try {
      const { data } = await fetchAdminDashboard({ signal });
      const distribution = data.data.planDist ?? [];
      setKpis(data.data.kpis ?? {});
      setRecentLogs(data.data.recentLogs ?? []);
      setExpiringUsers(data.data.atRisk ?? []);
      setExpiringUsersTotal(Number(data.data.atRiskTotal ?? data.data.atRisk?.length ?? 0));
      setMonthly((data.data.monthly ?? []).map((month) => ({
        year: Number(month.y),
        month: Number(month.m),
        count: Number(month.count || 0),
      })));
      const revenueData = data.data.revenue ?? {};
      const byType = new Map(distribution.map((plan) => [plan.type, plan]));
      const total = distribution.reduce((sum, plan) => sum + Number(plan.count || 0), 0);
      setPlans(PLAN_TYPES.map(({ type, color }) => {
        const plan = byType.get(type);
        const count = Number(plan?.count || 0);
        return {
          type,
          color,
          count,
          percentage: Number(plan?.percentage ?? (total > 0 ? (count / total * 100).toFixed(1) : 0)),
        };
      }));
      setRevenue({
        currency: revenueData.currency ?? "EGP",
        total: Number(revenueData.total || 0),
        byPlan: PLAN_TYPES.map(({ type }) => {
          const plan = revenueData.byPlan?.find((item) => item.type === type);
          return {
            type,
            count: Number(plan?.count || 0),
            price: Number(plan?.price || 0),
            revenue: Number(plan?.revenue || 0),
          };
        }),
      });
      setDashboardRequest({ status: "succeeded", error: "" });
    } catch (error) {
      if (signal?.aborted) return;
      setDashboardRequest({
        status: "failed",
        error: error.response?.data?.message ?? t("admin.home.dashboardError"),
      });
    }
  }, [t]);

  const refreshDashboard = useCallback((signal) => {
    loadStats(signal);
    loadDashboard(signal);
  }, [loadDashboard, loadStats]);

  useEffect(() => {
    const controller = new AbortController();
    const initialLoad = window.setTimeout(() => refreshDashboard(controller.signal), 0);
    const refreshTimer = window.setInterval(() => refreshDashboard(), 60_000);
    const refreshOnFocus = () => {
      if (document.visibilityState === "visible") refreshDashboard();
    };
    document.addEventListener("visibilitychange", refreshOnFocus);

    return () => {
      controller.abort();
      window.clearTimeout(initialLoad);
      window.clearInterval(refreshTimer);
      document.removeEventListener("visibilitychange", refreshOnFocus);
    };
  }, [refreshDashboard]);

  const dashboardLoading = dashboardRequest.status === "loading";
  const dashboardError = dashboardRequest.status === "failed" ? dashboardRequest.error : "";
  const shared = { t, language: i18n.language };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-8">
      <Hero admin={admin} kpis={kpis} loading={dashboardLoading} {...shared} />

      <StatCards
        stats={stats}
        loading={request.status === "loading"}
        error={request.status === "failed" ? request.error : ""}
        {...shared}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UserGrowthChart monthly={monthly} loading={dashboardLoading} error={dashboardError} {...shared} />
        </div>
        <PlanDistributionChart plans={plans} loading={dashboardLoading} error={dashboardError} {...shared} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <RevenueCard revenue={revenue} loading={dashboardLoading} error={dashboardError} {...shared} />
        <ExpiringUsersList
          users={expiringUsers}
          total={expiringUsersTotal}
          loading={dashboardLoading}
          error={dashboardError}
          {...shared}
        />
        <div className="lg:col-span-2 xl:col-span-1">
          <RecentActivity logs={recentLogs} loading={dashboardLoading} error={dashboardError} {...shared} />
        </div>
      </div>
    </div>
  );
}

export default AdminHomePage;
