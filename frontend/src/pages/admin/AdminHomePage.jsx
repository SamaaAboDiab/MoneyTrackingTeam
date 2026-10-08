import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Ban, ChartNoAxesColumn, Clock3, PieChart, UserCheck, Users, UserX } from "lucide-react";
import { fetchAdminDashboard, fetchAdminStats } from "../../api/adminAuthApi";
import { formatMoney } from "../../utils/formatAmount";
import { toIntlLocale } from "../../i18n/locale";

const EMPTY_STATS = { total: 0, active: 0, expiring: 0, expired: 0, suspended: 0 };
const PLAN_TYPES = [
  { type: "trial", color: "#3b82f6" },
  { type: "3months", color: "#8b5cf6" },
  { type: "6months", color: "#10b981" },
  { type: "yearly", color: "#f59e0b" },
  { type: "custom", color: "#ec4899" },
];
const DONUT_SIZE = 184;
const DONUT_RADIUS = 72;
const DONUT_STROKE = 24;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

function UserGrowthChart({ monthly, loading, error, t, language }) {
  const [period, setPeriod] = useState(12);
  const numberFormat = new Intl.NumberFormat(toIntlLocale(language));
  const dateFormat = new Intl.DateTimeFormat(toIntlLocale(language), { month: "short", year: "2-digit" });
  const visibleMonths = monthly.slice(-period);
  const total = visibleMonths.reduce((sum, month) => sum + month.count, 0);
  const maxCount = Math.max(1, ...visibleMonths.map((month) => month.count));

  return (
    <section aria-labelledby="admin-user-growth-title" className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="admin-user-growth-title" className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
            <ChartNoAxesColumn size={19} className="text-brand-600" />
            {t("admin.home.userGrowthTitle")}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{t("admin.home.userGrowthSubtitle")}</p>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <span>{t("admin.home.userGrowthPeriod")}</span>
          <select
            value={period}
            onChange={(event) => setPeriod(Number(event.target.value))}
            className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          >
            {[3, 6, 12].map((months) => (
              <option key={months} value={months}>{t("admin.home.lastMonths", { months })}</option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <div role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>
      ) : loading ? (
        <div role="status" className="mt-5">
          <span className="sr-only">{t("common.loading")}</span>
          <span aria-hidden="true" className="skeleton block h-56 rounded-xl" />
        </div>
      ) : (
        <>
          <div className="mt-5 flex flex-wrap items-baseline justify-between gap-2 rounded-xl bg-slate-50 px-4 py-3">
            <span className="text-sm font-semibold text-slate-600">{t("admin.home.userGrowthTotal", { months: period })}</span>
            <strong className="text-xl font-extrabold tabular-nums text-slate-900">{numberFormat.format(total)}</strong>
          </div>
          <div className="mt-5 overflow-x-auto pb-2">
            <ul
              aria-label={t("admin.home.userGrowthChartLabel", { months: period })}
              className="grid min-w-[540px] grid-flow-col auto-cols-fr items-end gap-2"
            >
              {visibleMonths.map((month) => {
                const date = new Date(month.year, month.month, 1);
                const monthLabel = dateFormat.format(date);
                const barHeight = month.count > 0 ? Math.max((month.count / maxCount) * 100, 6) : 2;
                return (
                  <li key={`${month.year}-${month.month}`} className="flex min-w-0 flex-col items-center gap-2">
                    <span className="text-xs font-bold tabular-nums text-slate-700">{numberFormat.format(month.count)}</span>
                    <div className="flex h-36 w-full items-end justify-center border-b border-slate-200">
                      <span
                        aria-hidden="true"
                        className={`w-2/3 max-w-10 rounded-t-md transition-[height] ${month.count > 0 ? "bg-brand-500" : "bg-slate-200"}`}
                        style={{ height: `${barHeight}%` }}
                      />
                    </div>
                    <span className="truncate text-xs font-medium text-slate-500">{monthLabel}</span>
                    <span className="sr-only">
                      {t("admin.home.userGrowthMonthValue", { month: monthLabel, value: numberFormat.format(month.count) })}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </section>
  );
}

function ExpiringUsersList({ users, total, loading, error, t, language }) {
  const numberFormat = new Intl.NumberFormat(toIntlLocale(language));
  const dateFormat = new Intl.DateTimeFormat(toIntlLocale(language), {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <section aria-labelledby="admin-expiring-users-title" className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 id="admin-expiring-users-title" className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
        <Clock3 size={19} className="text-amber-600" />
        {t("admin.home.expiringUsersTitle")}
      </h2>
      <p className="mt-1 text-sm text-slate-500">{t("admin.home.expiringUsersSubtitle")}</p>
      {total > users.length && (
        <p className="mt-2 text-xs font-medium text-slate-500">
          {t("admin.home.expiringUsersShowing", {
            shown: numberFormat.format(users.length),
            total: numberFormat.format(total),
          })}
          {" "}
          <Link to="/admin/users?status=expiring" className="font-bold text-brand-700 underline underline-offset-2">
            {t("admin.home.viewAllExpiringUsers")}
          </Link>
        </p>
      )}

      {error ? (
        <div role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>
      ) : loading ? (
        <div role="status" className="mt-5 space-y-3">
          <span className="sr-only">{t("common.loading")}</span>
          {[0, 1, 2].map((item) => <span key={item} aria-hidden="true" className="skeleton block h-16 rounded-xl" />)}
        </div>
      ) : users.length === 0 ? (
        <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">{t("admin.home.noExpiringUsers")}</p>
      ) : (
        <ul className="mt-4 divide-y divide-slate-100">
          {users.map((user) => (
            <li key={user._id} className="py-3 first:pt-0 last:pb-0">
              <Link
                to={`/admin/users?search=${encodeURIComponent(user.email)}&status=expiring`}
                className="flex flex-col gap-2 rounded-xl px-3 py-3 transition hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-slate-900">{user.name}</span>
                  <span dir="ltr" className="mt-0.5 block truncate text-start text-sm text-slate-500">{user.email}</span>
                </span>
                <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 sm:justify-end">
                  <span>{t(`admin.home.plans.${user.subscriptionType}`, { defaultValue: user.subscriptionType })}</span>
                  <span>{t("admin.home.expiresOn", { date: dateFormat.format(new Date(user.subscriptionEnd)) })}</span>
                  <strong className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-800">
                    {t("admin.home.daysRemaining", { days: numberFormat.format(user.daysLeft) })}
                  </strong>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function PlanDistributionChart({ plans, loading, error, revenue, t, language }) {
  const total = plans.reduce((sum, plan) => sum + plan.count, 0);
  const numberFormat = new Intl.NumberFormat(language);

  return (
    <section aria-labelledby="admin-plan-distribution-title" className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 id="admin-plan-distribution-title" className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
        <PieChart size={19} className="text-brand-600" />
        {t("admin.home.planDistributionTitle")}
      </h2>
      <p className="mt-1 text-sm text-slate-500">{t("admin.home.planDistributionSubtitle")}</p>

      {error ? (
        <div role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : loading ? (
        <div role="status" className="mt-5 flex flex-col items-center gap-6 sm:flex-row">
          <span className="sr-only">{t("common.loading")}</span>
          <span aria-hidden="true" className="skeleton block h-[184px] w-[184px] shrink-0 rounded-full" />
          <div aria-hidden="true" className="w-full flex-1 space-y-3">
            {PLAN_TYPES.map(({ type }) => <span key={type} className="skeleton block h-8 rounded-lg" />)}
          </div>
        </div>
      ) : (
        <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="relative h-[184px] w-[184px] shrink-0">
            <svg
              viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
              role="img"
              aria-label={t("admin.home.planDistributionChartLabel", { total: numberFormat.format(total) })}
              className="h-full w-full -rotate-90"
            >
              <circle
                cx={DONUT_SIZE / 2}
                cy={DONUT_SIZE / 2}
                r={DONUT_RADIUS}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth={DONUT_STROKE}
              />
              {plans.map((plan, index) => {
                const arcLength = total > 0 ? plan.count / total * DONUT_CIRCUMFERENCE : 0;
                const offset = plans.slice(0, index).reduce(
                  (sum, previousPlan) => sum + (total > 0 ? previousPlan.count / total * DONUT_CIRCUMFERENCE : 0),
                  0,
                );
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
              <span className="text-xs font-medium text-slate-500">{t("admin.home.planDistributionTotal")}</span>
              <strong className="text-2xl font-extrabold tabular-nums text-slate-900">{numberFormat.format(total)}</strong>
            </div>
          </div>

          <ul className="w-full flex-1 space-y-1" aria-label={t("admin.home.planDistributionLegend")}>
            {plans.map((plan) => (
              <li key={plan.type} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2">
                <span className="flex min-w-0 items-center gap-2">
                  <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: plan.color }} />
                  <span className="truncate text-sm font-semibold text-slate-700">{t(`admin.home.plans.${plan.type}`)}</span>
                </span>
                <span className="shrink-0 text-sm tabular-nums text-slate-600">
                  <strong className="font-bold text-slate-900">{numberFormat.format(plan.count)}</strong>
                  <span className="mx-2 text-slate-300">·</span>
                  {numberFormat.format(plan.percentage)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {loading || error ? null : (
        <section aria-labelledby="admin-subscription-revenue-title" className="mt-6 border-t border-slate-100 pt-5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h3 id="admin-subscription-revenue-title" className="text-base font-extrabold text-slate-900">
                {t("admin.home.revenueTitle")}
              </h3>
              <p className="mt-1 text-xs text-slate-500">{t("admin.home.revenueBasis")}</p>
            </div>
            <strong className="text-xl font-extrabold tabular-nums text-slate-900">
              {formatMoney(revenue.total, revenue.currency)}
            </strong>
          </div>
          <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5">
            {revenue.byPlan.map((plan) => (
              <li key={plan.type} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: PLAN_TYPES.find((item) => item.type === plan.type)?.color }}
                  />
                  <span className="truncate text-sm font-semibold text-slate-700">{t(`admin.home.plans.${plan.type}`)}</span>
                </div>
                <strong className="mt-2 block text-lg font-extrabold tabular-nums text-slate-900">
                  {formatMoney(plan.revenue, revenue.currency)}
                </strong>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  {t("admin.home.revenueCalculation", {
                    count: new Intl.NumberFormat(language).format(plan.count),
                    price: formatMoney(plan.price, revenue.currency),
                  })}
                </span>
              </li>
            ))}
          </ul>
        </section>
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

  const cards = [
    { key: "total", value: stats.total, icon: Users, color: "bg-blue-50 text-blue-700" },
    { key: "active", value: stats.active, icon: UserCheck, color: "bg-emerald-50 text-emerald-700" },
    { key: "expiring", value: stats.expiring, icon: Clock3, color: "bg-amber-50 text-amber-700" },
    { key: "expired", value: stats.expired, icon: UserX, color: "bg-slate-100 text-slate-700" },
    { key: "suspended", value: stats.suspended, icon: Ban, color: "bg-red-50 text-red-700" },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-xl font-extrabold text-slate-900">
          {t("admin.home.welcome", { name: admin?.name ?? "" })}
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">{t("admin.home.subtitle")}</p>
        <Link
          to="/admin/users"
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
        >
          <Users size={17} />
          {t("admin.home.usersLink")}
        </Link>
      </section>

      <section aria-label={t("admin.home.statsTitle")} className="mt-6">
        <h2 className="mb-3 text-lg font-extrabold text-slate-900">{t("admin.home.statsTitle")}</h2>
        {request.status === "failed" ? (
          <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
            {request.error}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {cards.map(({ key, value, icon: Icon, color }) => (
              <article key={key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-600">{t(`admin.home.stats.${key}`)}</span>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                    <Icon size={19} />
                  </span>
                </div>
                <p className="mt-4 text-3xl font-extrabold tabular-nums text-slate-900" aria-live="polite">
                  {request.status === "loading" ? "…" : value}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <PlanDistributionChart
        plans={plans}
        revenue={revenue}
        loading={dashboardRequest.status === "loading"}
        error={dashboardRequest.status === "failed" ? dashboardRequest.error : ""}
        t={t}
        language={i18n.language}
      />
      <UserGrowthChart
        monthly={monthly}
        loading={dashboardRequest.status === "loading"}
        error={dashboardRequest.status === "failed" ? dashboardRequest.error : ""}
        t={t}
        language={i18n.language}
      />
      <ExpiringUsersList
        users={expiringUsers}
        total={expiringUsersTotal}
        loading={dashboardRequest.status === "loading"}
        error={dashboardRequest.status === "failed" ? dashboardRequest.error : ""}
        t={t}
        language={i18n.language}
      />
    </div>
  );
}

export default AdminHomePage;
