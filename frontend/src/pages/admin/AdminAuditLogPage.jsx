import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ClipboardList, Search } from "lucide-react";
import { fetchAdminLogs } from "../../api/adminUsersApi";
import PageHeader from "../../components/common/PageHeader";

const PAGE_SIZE = 20;
const ACTIONS = [
  "create_user",
  "extend_subscription",
  "change_plan",
  "add_free_days",
  "suspend",
  "activate",
  "manual_date",
];
const EMPTY_FILTERS = { action: "all", user: "", from: "", to: "" };

function AdminAuditLogPage() {
  const { t, i18n } = useTranslation();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, pages: 0 });
  const [request, setRequest] = useState({ key: "", status: "loading", error: "" });
  const requestKey = JSON.stringify({ appliedFilters, page });
  const isLoading = request.key !== requestKey || request.status === "loading";

  useEffect(() => {
    const controller = new AbortController();
    const params = {
      page,
      limit: PAGE_SIZE,
      ...(appliedFilters.action !== "all" && { action: appliedFilters.action }),
      ...(appliedFilters.user.trim() && { user: appliedFilters.user.trim() }),
      ...(appliedFilters.from && { from: appliedFilters.from }),
      ...(appliedFilters.to && { to: appliedFilters.to }),
    };

    fetchAdminLogs(params, { signal: controller.signal })
      .then(({ data }) => {
        setLogs(data.data);
        setPagination(data.pagination);
        setRequest({ key: requestKey, status: "succeeded", error: "" });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setRequest({
          key: requestKey,
          status: "failed",
          error: error.response?.data?.message ?? t("admin.auditLogs.loadError"),
        });
      });

    return () => controller.abort();
  }, [appliedFilters, page, requestKey, t]);

  const handleFilterChange = ({ target }) => {
    setFilters((current) => ({ ...current, [target.name]: target.value }));
  };

  const applyFilters = (event) => {
    event.preventDefault();
    setPage(1);
    setAppliedFilters({ ...filters, user: filters.user.trim() });
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const formatDateTime = (value) => {
    if (!value) return t("admin.auditLogs.notAvailable");
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return t("admin.auditLogs.notAvailable");
    return new Intl.DateTimeFormat(i18n.language, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  };

  const getPersonLabel = (person) => {
    if (!person) return t("admin.auditLogs.deletedPerson");
    return person.name || person.email || person._id || t("admin.auditLogs.deletedPerson");
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        icon={ClipboardList}
        title={t("admin.auditLogs.title")}
        subtitle={t("admin.auditLogs.subtitle")}
      />

      <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <form onSubmit={applyFilters} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="text-sm font-semibold text-slate-700">
            {t("admin.auditLogs.action")}
            <select
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
              className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 font-normal outline-none focus:border-brand-500"
            >
              <option value="all">{t("admin.auditLogs.allActions")}</option>
              {ACTIONS.map((action) => (
                <option key={action} value={action}>{t(`admin.auditLogs.actions.${action}`)}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700">
            {t("admin.auditLogs.user")}
            <input
              name="user"
              type="search"
              maxLength={100}
              value={filters.user}
              onChange={handleFilterChange}
              placeholder={t("admin.auditLogs.userPlaceholder")}
              className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-brand-500"
            />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            {t("admin.auditLogs.from")}
            <input
              name="from"
              type="date"
              value={filters.from}
              onChange={handleFilterChange}
              className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-brand-500"
            />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            {t("admin.auditLogs.to")}
            <input
              name="to"
              type="date"
              value={filters.to}
              onChange={handleFilterChange}
              className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-brand-500"
            />
          </label>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-bold text-white transition hover:bg-brand-700"
            >
              <Search size={16} />
              {t("admin.auditLogs.applyFilters")}
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="min-h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {t("admin.auditLogs.clear")}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <p className="mb-3 text-sm text-slate-500" aria-live="polite">
          {t("admin.auditLogs.total", { count: pagination.total })}
        </p>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-slate-500">{t("common.loading")}</div>
        ) : request.status === "failed" ? (
          <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">{request.error}</div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">{t("admin.auditLogs.empty")}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-start text-sm">
              <thead className="border-b border-slate-200 text-xs font-bold text-slate-500">
                <tr>
                  <th scope="col" className="px-3 py-3">{t("admin.auditLogs.time")}</th>
                  <th scope="col" className="px-3 py-3">{t("admin.auditLogs.admin")}</th>
                  <th scope="col" className="px-3 py-3">{t("admin.auditLogs.targetUser")}</th>
                  <th scope="col" className="px-3 py-3">{t("admin.auditLogs.action")}</th>
                  <th scope="col" className="px-3 py-3">{t("admin.auditLogs.details")}</th>
                  <th scope="col" className="px-3 py-3">{t("admin.auditLogs.reason")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((entry) => (
                  <tr key={entry._id} className="align-top text-slate-700">
                    <td className="whitespace-nowrap px-3 py-4">{formatDateTime(entry.createdAt)}</td>
                    <td className="px-3 py-4">
                      <div className="font-semibold text-slate-900">{getPersonLabel(entry.admin)}</div>
                      {entry.admin?.email && <div dir="ltr" className="mt-1 text-xs text-slate-500">{entry.admin.email}</div>}
                    </td>
                    <td className="px-3 py-4">
                      <div className="font-semibold text-slate-900">{getPersonLabel(entry.user)}</div>
                      {entry.user?.email && <div dir="ltr" className="mt-1 text-xs text-slate-500">{entry.user.email}</div>}
                    </td>
                    <td className="px-3 py-4">
                      <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
                        {t(`admin.auditLogs.actions.${entry.action}`, { defaultValue: entry.action })}
                      </span>
                    </td>
                    <td className="max-w-sm px-3 py-4">
                      <pre className="whitespace-pre-wrap break-words font-sans text-xs text-slate-600">
                        {entry.details && Object.keys(entry.details).length
                          ? JSON.stringify(entry.details, null, 2)
                          : t("admin.auditLogs.noDetails")}
                      </pre>
                    </td>
                    <td className="max-w-xs whitespace-pre-wrap break-words px-3 py-4 text-slate-600">
                      {entry.reason || t("admin.auditLogs.noReason")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && request.status === "succeeded" && pagination.pages > 1 && (
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
              className="min-h-10 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("admin.auditLogs.previous")}
            </button>
            <span className="text-sm text-slate-500">
              {t("admin.auditLogs.page", { page: pagination.page, pages: pagination.pages })}
            </span>
            <button
              type="button"
              disabled={page >= pagination.pages}
              onClick={() => setPage((current) => current + 1)}
              className="min-h-10 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("admin.auditLogs.next")}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminAuditLogPage;
