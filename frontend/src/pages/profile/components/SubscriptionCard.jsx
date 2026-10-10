import { useCallback, useEffect, useState } from "react";
import { Check, Clock, CreditCard, RefreshCw, X } from "lucide-react";
import { cancelMyRenewal, fetchMyRenewal, requestRenewal } from "../../../api/userExtrasApi";
import { formatMoney } from "../../../utils/formatAmount";
import { toIntlLocale } from "../../../i18n/locale";

const STATUS_PILL = {
  active: "bg-emerald-50 text-emerald-700",
  expiring: "bg-amber-50 text-amber-700",
  expired: "bg-rose-50 text-rose-700",
  suspended: "bg-rose-50 text-rose-700",
};

// The user's plan, and asking the admin team to renew it (one pending request at a time).
function SubscriptionCard({ t, language }) {
  const [info, setInfo] = useState(null);
  const [status, setStatus] = useState("loading");
  const [picking, setPicking] = useState(false);
  const [plan, setPlan] = useState("3months");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
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

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await requestRenewal({ plan, note: note.trim() });
      setPicking(false);
      setNote("");
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || t("subscription.requestError"));
    }
    setBusy(false);
  };

  const cancel = async () => {
    setBusy(true);
    try {
      await cancelMyRenewal();
      await load();
    } catch {
      setError(t("subscription.requestError"));
    }
    setBusy(false);
  };

  if (status === "loading") return <span className="skeleton mt-5 block h-40 rounded-2xl" aria-hidden="true" />;
  if (status === "error" || !info?.subscription) return null;

  const { subscription, plans, currency, latest } = info;
  const pending = latest?.status === "pending";
  const statusKey = STATUS_PILL[subscription._status] ? subscription._status : "active";

  return (
    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
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
        <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
            <Clock size={16} />
            {t("subscription.pending", { plan: t(`admin.home.plans.${latest.plan}`) })}
          </p>
          <button
            type="button"
            onClick={cancel}
            disabled={busy}
            className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-white px-3 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-60"
          >
            <X size={15} />
            {t("subscription.cancelRequest")}
          </button>
        </div>
      ) : (
        <>
          {latest && latest.status !== "pending" && (
            <p className={`mt-4 rounded-xl px-4 py-2.5 text-sm font-medium ${latest.status === "approved" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
              {t(latest.status === "approved" ? "subscription.lastApproved" : "subscription.lastRejected", {
                plan: t(`admin.home.plans.${latest.plan}`),
              })}
              {latest.response && <span className="mt-1 block text-xs opacity-80">“{latest.response}”</span>}
            </p>
          )}

          {picking ? (
            <form onSubmit={submit} className="mt-4 space-y-3">
              <div role="radiogroup" aria-label={t("subscription.choosePlan")} className="grid gap-2 sm:grid-cols-3">
                {plans.map((option) => {
                  const selected = plan === option.plan;
                  return (
                    <button
                      key={option.plan}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setPlan(option.plan)}
                      className={`flex items-center justify-between gap-2 rounded-2xl border px-4 py-3 text-start transition ${
                        selected ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/15" : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <span>
                        <span className="block text-sm font-bold text-slate-900">{t(`admin.home.plans.${option.plan}`)}</span>
                        <span className="block text-xs text-slate-500">{formatMoney(option.price, currency)}</span>
                      </span>
                      {selected && <Check size={17} className="text-brand-600" />}
                    </button>
                  );
                })}
              </div>
              <textarea
                value={note}
                maxLength={500}
                rows={2}
                onChange={(event) => setNote(event.target.value)}
                placeholder={t("subscription.notePlaceholder")}
                aria-label={t("subscription.notePlaceholder")}
                className="min-h-0 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:bg-white"
              />
              {error && <p role="alert" className="rounded-xl bg-expense-soft px-4 py-2.5 text-sm font-medium text-expense">{error}</p>}
              <div className="flex gap-2">
                <button type="submit" disabled={busy} className="min-h-11 flex-1 rounded-xl bg-brand-600 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60">
                  {busy ? t("subscription.sending") : t("subscription.send")}
                </button>
                <button type="button" onClick={() => setPicking(false)} className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  {t("common.cancel")}
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setPicking(true)}
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
            >
              <RefreshCw size={16} />
              {t("subscription.renew")}
            </button>
          )}
        </>
      )}
    </section>
  );
}

export default SubscriptionCard;
