import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, Clock, CreditCard, RefreshCw, X } from "lucide-react";
import { cancelMyRenewal, fetchMyRenewal } from "../../../api/userExtrasApi";
import { formatMoney } from "../../../utils/formatAmount";
import { toIntlLocale } from "../../../i18n/locale";
import RenewalCheckout from "./RenewalCheckout";
import SuccessToast from "../../../components/common/SuccessToast";

const STATUS_PILL = {
  active: "bg-emerald-50 text-emerald-700",
  expiring: "bg-amber-50 text-amber-700",
  expired: "bg-rose-50 text-rose-700",
  suspended: "bg-rose-50 text-rose-700",
};

// The user's plan, and renewing it: pay, attach proof, wait for the admin to confirm.
function SubscriptionCard({ t, language }) {
  const [info, setInfo] = useState(null);
  const [status, setStatus] = useState("loading");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const dateFormat = new Intl.DateTimeFormat(toIntlLocale(language), { dateStyle: "medium" });

  const load = useCallback(async () => {
    try {
      const { data } = await fetchMyRenewal();
      setInfo(data.data);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const closeToast = useCallback(() => setToast(""), []);

  const cancel = async () => {
    setBusy(true);
    setError("");
    try {
      await cancelMyRenewal();
      await load();
    } catch {
      setError(t("subscription.requestError"));
    }
    setBusy(false);
  };

  if (status === "loading") return <span className="skeleton block h-40 rounded-3xl" aria-hidden="true" />;
  if (status === "error" || !info?.subscription) return null;

  const { subscription, latest } = info;
  const pending = latest?.status === "pending";
  const statusKey = STATUS_PILL[subscription._status] ? subscription._status : "active";

  return (
    <section className="h-full rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <CreditCard size={19} />
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900">{t("subscription.title")}</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {t(`admin.home.plans.${subscription.subscriptionType}`, { defaultValue: subscription.subscriptionType })}
              {subscription.subscriptionEnd && ` · ${t("subscription.endsOn", { date: dateFormat.format(new Date(subscription.subscriptionEnd)) })}`}
            </p>
          </div>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_PILL[statusKey]}`}>
          {t(`admin.users.status.${subscription._status}`)}
        </span>
      </div>

      {pending ? (
        <div className="mt-4 rounded-2xl bg-amber-50 p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-amber-900">
            <Clock size={16} />
            {t("subscription.pendingTitle")}
          </p>
          <p className="mt-1 text-sm text-amber-800">
            {latest.payment?.method
              ? t("subscription.pendingPaid", {
                  plan: t(`admin.home.plans.${latest.plan}`),
                  amount: formatMoney(latest.payment.amount, latest.payment.currency),
                  method: t(`subscription.methods.${latest.payment.method}`),
                })
              : t("subscription.pending", { plan: t(`admin.home.plans.${latest.plan}`) })}
          </p>
          <button
            type="button"
            onClick={cancel}
            disabled={busy}
            className="mt-3 inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-white px-3 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-60"
          >
            <X size={15} />
            {t("subscription.cancelRequest")}
          </button>
        </div>
      ) : (
        <>
          {latest && latest.status !== "pending" && (
            <div className={`mt-4 flex items-start gap-3 rounded-2xl px-4 py-3 text-sm font-medium ${latest.status === "approved" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
              {latest.status === "approved" && (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 text-white shadow-sm shadow-emerald-500/30">
                  <BadgeCheck size={17} />
                </span>
              )}
              <p className="min-w-0 pt-1">
                {t(latest.status === "approved" ? "subscription.lastApproved" : "subscription.lastRejected", {
                  plan: t(`admin.home.plans.${latest.plan}`),
                })}
                {latest.response && <span className="mt-1 block text-xs opacity-80">“{latest.response}”</span>}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setCheckoutOpen(true)}
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
          >
            <RefreshCw size={16} />
            {t("subscription.renew")}
          </button>
        </>
      )}
      {error && <p role="alert" className="mt-3 rounded-xl bg-expense-soft px-4 py-2.5 text-sm font-medium text-expense">{error}</p>}

      {checkoutOpen && (
        <RenewalCheckout
          t={t}
          info={info}
          onClose={() => setCheckoutOpen(false)}
          onDone={async () => {
            setCheckoutOpen(false);
            setToast(t("subscription.checkout.sent"));
            await load();
          }}
        />
      )}
      <SuccessToast message={toast} onClose={closeToast} title={t("subscription.checkout.sentTitle")} />
    </section>
  );
}

export default SubscriptionCard;
