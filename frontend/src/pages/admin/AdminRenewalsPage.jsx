import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, ClipboardCheck, Inbox, MessageSquareText, X } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import SuccessToast from "../../components/common/SuccessToast";
import { approveRenewal, fetchRenewals, rejectRenewal } from "../../api/adminExtrasApi";
import { formatMoney } from "../../utils/formatAmount";
import { toIntlLocale } from "../../i18n/locale";

const TABS = ["pending", "approved", "rejected"];
const STATUS_PILL = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-rose-50 text-rose-700",
};

// Users asking to renew: approve (the plan starts right away) or reject, with an optional note.
function AdminRenewalsPage() {
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState("pending");
  const [items, setItems] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [status, setStatus] = useState("loading");
  const [busyId, setBusyId] = useState("");
  const [responses, setResponses] = useState({});
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const dateFormat = new Intl.DateTimeFormat(toIntlLocale(i18n.language), { dateStyle: "medium" });

  const load = useCallback(async () => {
    try {
      const { data } = await fetchRenewals({ status: tab });
      setItems(data.data);
      setPendingCount(data.pendingCount);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [tab]);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const closeToast = useCallback(() => setToast(""), []);

  const decide = async (item, approve) => {
    setError("");
    setBusyId(item._id);
    try {
      await (approve ? approveRenewal : rejectRenewal)(item._id, responses[item._id] || "");
      setItems((current) => current.filter((entry) => entry._id !== item._id));
      setPendingCount((count) => Math.max(0, count - 1));
      setToast(t(approve ? "admin.renewals.approvedToast" : "admin.renewals.rejectedToast", { name: item.user?.name || "" }));
    } catch (decideError) {
      setError(decideError.response?.data?.message || t("admin.renewals.actionError"));
    }
    setBusyId("");
  };

  return (
    <div className="mx-auto max-w-5xl pb-8">
      <PageHeader icon={ClipboardCheck} title={t("admin.renewals.title")} subtitle={t("admin.renewals.subtitle")} />

      <div role="tablist" aria-label={t("admin.renewals.title")} className="no-scrollbar mb-5 flex w-full gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 sm:w-fit">
        {TABS.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => {
              setStatus("loading");
              setTab(key);
            }}
            className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition ${
              tab === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t(`admin.renewals.tabs.${key}`)}
            {key === "pending" && pendingCount > 0 && (
              <span className="rounded-full bg-amber-500 px-1.5 text-[11px] font-bold text-white">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {error && <p role="alert" className="mb-4 rounded-xl bg-expense-soft px-4 py-2.5 text-sm font-medium text-expense">{error}</p>}

      {status === "loading" ? (
        <div className="grid gap-4 md:grid-cols-2" aria-hidden="true">
          {[0, 1].map((item) => <span key={item} className="skeleton block h-48 rounded-3xl" />)}
        </div>
      ) : status === "error" ? (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">{t("admin.renewals.loadError")}</p>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-slate-200/80 bg-white py-14 text-center shadow-sm">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Inbox size={26} />
          </span>
          <p className="text-sm text-slate-500">{t(`admin.renewals.empty.${tab}`)}</p>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <li key={item._id} className="flex flex-col rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {item.user ? (
                    <Link to={`/admin/users/${item.user._id}`} className="block truncate font-bold text-slate-900 hover:text-brand-700">
                      {item.user.name}
                    </Link>
                  ) : (
                    <p className="font-bold text-slate-500">{t("admin.auditLogs.deletedPerson")}</p>
                  )}
                  <p dir="ltr" className="truncate text-xs text-slate-500 rtl:text-right">{item.user?.email}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_PILL[item.status]}`}>
                  {t(`admin.renewals.tabs.${item.status}`)}
                </span>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-3 text-xs">
                <div>
                  <dt className="text-slate-500">{t("admin.renewals.requestedPlan")}</dt>
                  <dd className="mt-0.5 text-sm font-bold text-slate-900">{t(`admin.home.plans.${item.plan}`)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">{t("admin.renewals.price")}</dt>
                  <dd className="mt-0.5 text-sm font-bold text-emerald-700">{formatMoney(item.price, item.currency)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">{t("admin.renewals.currentPlan")}</dt>
                  <dd className="mt-0.5 font-semibold text-slate-700">
                    {item.user ? t(`admin.home.plans.${item.user.subscriptionType}`, { defaultValue: item.user.subscriptionType }) : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">{t("admin.renewals.requestedOn")}</dt>
                  <dd className="mt-0.5 font-semibold text-slate-700">{dateFormat.format(new Date(item.createdAt))}</dd>
                </div>
              </dl>

              {item.note && (
                <p className="mt-3 flex gap-2 rounded-xl bg-brand-50/50 px-3 py-2 text-sm text-slate-700">
                  <MessageSquareText size={15} className="mt-0.5 shrink-0 text-brand-500" aria-hidden="true" />
                  <span className="whitespace-pre-wrap break-words">{item.note}</span>
                </p>
              )}

              {item.status === "pending" ? (
                <div className="mt-4 space-y-3">
                  <input
                    value={responses[item._id] || ""}
                    maxLength={500}
                    onChange={(event) => setResponses((current) => ({ ...current, [item._id]: event.target.value }))}
                    placeholder={t("admin.renewals.responsePlaceholder")}
                    aria-label={t("admin.renewals.responsePlaceholder")}
                    className="min-h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-brand-500 focus:bg-white"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={busyId === item._id}
                      onClick={() => decide(item, true)}
                      className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-600 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
                    >
                      <Check size={16} />
                      {t("admin.renewals.approve")}
                    </button>
                    <button
                      type="button"
                      disabled={busyId === item._id}
                      onClick={() => decide(item, false)}
                      className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-60"
                    >
                      <X size={16} />
                      {t("admin.renewals.reject")}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-xs text-slate-500">
                  {t("admin.renewals.handledBy", {
                    name: item.handledByName || "—",
                    date: item.handledAt ? dateFormat.format(new Date(item.handledAt)) : "—",
                  })}
                  {item.response && <span className="mt-1 block text-slate-600">“{item.response}”</span>}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      <SuccessToast message={toast} onClose={closeToast} title={t("admin.renewals.doneTitle")} />
    </div>
  );
}

export default AdminRenewalsPage;
