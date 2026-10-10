import { useRef, useState } from "react";
import { Check, Copy, CreditCard, ImageUp, Landmark, Smartphone, X } from "lucide-react";
import FormModal from "../../../components/common/FormModal";
import { requestRenewal } from "../../../api/userExtrasApi";
import { formatMoney } from "../../../utils/formatAmount";

const MAX_PROOF_BYTES = 4 * 1024 * 1024;
const METHOD_STYLE = {
  vodafone_cash: { icon: Smartphone, tone: "bg-rose-50 text-rose-600" },
  instapay: { icon: Landmark, tone: "bg-violet-50 text-violet-600" },
  card: { icon: CreditCard, tone: "bg-sky-50 text-sky-600" },
};
const STEPS = ["plan", "method", "pay"];
const inputClass =
  "min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm outline-none transition focus:border-brand-500 focus:bg-white";

// Renewing: pick a plan → pick how to pay → send the money and attach proof.
// The plan only starts after an admin confirms the payment.
function RenewalCheckout({ t, info, onClose, onDone }) {
  const { plans, currency, paymentMethods = [], paymentInstructions } = info;
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState(plans[0]?.plan ?? "3months");
  const [method, setMethod] = useState(paymentMethods.find((option) => option.available)?.method ?? "");
  const [reference, setReference] = useState("");
  const [sender, setSender] = useState("");
  const [note, setNote] = useState("");
  const [proof, setProof] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const price = plans.find((option) => option.plan === plan)?.price ?? 0;
  const chosen = paymentMethods.find((option) => option.method === method);
  const anyAvailable = paymentMethods.some((option) => option.available);

  const pickProof = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setError(t("subscription.checkout.proofType"));
      return;
    }
    if (file.size > MAX_PROOF_BYTES) {
      setError(t("subscription.checkout.proofSize"));
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => setProof(String(reader.result));
    reader.readAsDataURL(file);
  };

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText(chosen.account);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked: the number is still shown to copy by hand.
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!proof) {
      setError(t("subscription.checkout.proofRequired"));
      return;
    }
    setBusy(true);
    setError("");
    try {
      await requestRenewal({ plan, method, reference: reference.trim(), sender: sender.trim(), proof, note: note.trim() });
      onDone();
    } catch (requestError) {
      setError(requestError.response?.data?.message || t("subscription.requestError"));
      setBusy(false);
    }
  };

  return (
    <FormModal title={t("subscription.checkout.title")} onClose={onClose} closeDisabled={busy}>
      {/* Steps */}
      <ol className="mt-4 flex items-center gap-2" aria-label={t("subscription.checkout.title")}>
        {STEPS.map((key, index) => (
          <li key={key} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                index < step ? "bg-brand-600 text-white" : index === step ? "bg-brand-50 text-brand-700 ring-2 ring-brand-500" : "bg-slate-100 text-slate-400"
              }`}
            >
              {index < step ? <Check size={14} /> : index + 1}
            </span>
            <span className={`hidden text-xs font-semibold sm:inline ${index === step ? "text-slate-900" : "text-slate-400"}`}>
              {t(`subscription.checkout.steps.${key}`)}
            </span>
            {index < STEPS.length - 1 && <span aria-hidden="true" className={`h-px flex-1 ${index < step ? "bg-brand-500" : "bg-slate-200"}`} />}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="mt-5 space-y-2">
          {plans.map((option) => {
            const selected = plan === option.plan;
            return (
              <button
                key={option.plan}
                type="button"
                onClick={() => setPlan(option.plan)}
                aria-pressed={selected}
                className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-start transition ${
                  selected ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/15" : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${selected ? "border-brand-600 bg-brand-600" : "border-slate-300"}`}>
                    {selected && <Check size={12} className="text-white" />}
                  </span>
                  <span className="text-sm font-bold text-slate-900">{t(`admin.home.plans.${option.plan}`)}</span>
                </span>
                <span className="text-sm font-extrabold tabular-nums text-slate-900">{formatMoney(option.price, currency)}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setStep(1)}
            className="mt-3 min-h-11 w-full rounded-xl bg-brand-600 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            {t("subscription.checkout.continue")}
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="mt-5 space-y-2">
          <p className="text-sm text-slate-600">
            {t("subscription.checkout.amountToPay")}{" "}
            <strong className="text-slate-900">{formatMoney(price, currency)}</strong>
          </p>
          {paymentMethods.map((option) => {
            const { icon: Icon, tone } = METHOD_STYLE[option.method] || METHOD_STYLE.card;
            const selected = method === option.method;
            return (
              <button
                key={option.method}
                type="button"
                disabled={!option.available}
                onClick={() => setMethod(option.method)}
                aria-pressed={selected}
                className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-start transition disabled:cursor-not-allowed disabled:opacity-55 ${
                  selected ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/15" : "border-slate-200 enabled:hover:bg-slate-50"
                }`}
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                  <Icon size={19} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-slate-900">{t(`subscription.methods.${option.method}`)}</span>
                  <span className="block text-xs text-slate-500">
                    {option.available ? t(`subscription.methodHints.${option.method}`) : t("subscription.checkout.unavailable")}
                  </span>
                </span>
                {selected && <Check size={18} className="shrink-0 text-brand-600" />}
              </button>
            );
          })}
          {!anyAvailable && (
            <p className="rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-800">{t("subscription.checkout.noMethods")}</p>
          )}
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => setStep(0)} className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              {t("subscription.checkout.back")}
            </button>
            <button
              type="button"
              disabled={!chosen?.available}
              onClick={() => setStep(2)}
              className="min-h-11 flex-1 rounded-xl bg-brand-600 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              {t("subscription.checkout.continue")}
            </button>
          </div>
        </div>
      )}

      {step === 2 && chosen && (
        <form onSubmit={submit} className="mt-5 space-y-4">
          {/* Where to send the money */}
          <div className="rounded-2xl bg-linear-to-br from-navy-800 to-navy-900 p-4 text-white">
            <p className="text-xs text-slate-300">{t(`subscription.sendTo.${chosen.method}`)}</p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <span dir="ltr" className="truncate text-lg font-extrabold tracking-wide">{chosen.account}</span>
              <button
                type="button"
                onClick={copyAccount}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-xs font-bold ring-1 ring-white/15 transition hover:bg-white/15"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? t("subscription.checkout.copied") : t("subscription.checkout.copy")}
              </button>
            </div>
            {chosen.accountName && <p className="mt-0.5 text-xs text-slate-300">{chosen.accountName}</p>}
            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-sm">
              <span className="text-slate-300">{t("subscription.checkout.amountToPay")}</span>
              <strong className="text-base font-extrabold text-brand-300">{formatMoney(price, currency)}</strong>
            </div>
          </div>
          {paymentInstructions && <p className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs leading-6 text-slate-600">{paymentInstructions}</p>}

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">
              {t("subscription.checkout.reference")}
              <input value={reference} onChange={(event) => setReference(event.target.value)} maxLength={100} required dir="ltr" className={`mt-1.5 ${inputClass}`} />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              {t(`subscription.checkout.sender.${chosen.method}`)}
              <input value={sender} onChange={(event) => setSender(event.target.value)} maxLength={100} required dir="ltr" className={`mt-1.5 ${inputClass}`} />
            </label>
          </div>

          {/* Proof */}
          <div>
            <p className="text-sm font-semibold text-slate-700">{t("subscription.checkout.proof")}</p>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={pickProof} />
            {proof ? (
              <div className="relative mt-1.5 overflow-hidden rounded-2xl border border-slate-200">
                <img src={proof} alt={t("subscription.checkout.proof")} className="max-h-48 w-full bg-slate-50 object-contain" />
                <button
                  type="button"
                  onClick={() => setProof("")}
                  aria-label={t("subscription.checkout.removeProof")}
                  className="absolute top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow ring-1 ring-slate-200 transition hover:text-expense inset-e-2"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-1.5 flex w-full flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed border-slate-200 px-4 py-5 text-center transition hover:border-brand-300 hover:bg-brand-50/40"
              >
                <ImageUp size={22} className="text-slate-400" />
                <span className="text-sm font-semibold text-slate-700">{t("subscription.checkout.uploadProof")}</span>
                <span className="text-xs text-slate-400">{t("subscription.checkout.proofHint")}</span>
              </button>
            )}
          </div>

          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={500}
            rows={2}
            placeholder={t("subscription.notePlaceholder")}
            aria-label={t("subscription.notePlaceholder")}
            className="min-h-0 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:bg-white"
          />

          {error && <p role="alert" className="rounded-xl bg-expense-soft px-4 py-2.5 text-sm font-medium text-expense">{error}</p>}

          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(1)} disabled={busy} className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              {t("subscription.checkout.back")}
            </button>
            <button type="submit" disabled={busy} className="min-h-11 flex-1 rounded-xl bg-brand-600 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60">
              {busy ? t("subscription.sending") : t("subscription.checkout.submit")}
            </button>
          </div>
          <p className="text-center text-xs text-slate-400">{t("subscription.checkout.afterSubmit")}</p>
        </form>
      )}
    </FormModal>
  );
}

export default RenewalCheckout;
