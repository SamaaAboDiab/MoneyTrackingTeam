import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Landmark, Loader2 } from "lucide-react";
import { getAccounts, transferFunds } from "../../api/accountsApi";
export default function CashWithdrawalForm({ onSuccess, onClose }) {
  const { t } = useTranslation();
  const [cashAccount, setCashAccount] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchAccounts() {
      try {
        const res = await getAccounts();
       const allAccounts = res.data?.data || res.data?.accounts || res.data || [];
        if (!isMounted) return;

        const cash = allAccounts.find(
          (acc) => acc.type?.toLowerCase() === "cash"
        );
        const banks = allAccounts.filter(
          (acc) => acc.type?.toLowerCase() === "bank"
        );

        setCashAccount(cash || null);
        setBankAccounts(banks);

        if (banks.length) {
          setSelectedAccountId(banks[0].id ?? banks[0]._id);
        }

        if (!cash) {
          setError(t("cash.errors.noCashAccount"));
        }
      } catch {
        if (isMounted) setError(t("cash.errors.loadAccountsFailed"));
      } finally {
        if (isMounted) setLoadingAccounts(false);
      }
    }

    fetchAccounts();
    return () => {
      isMounted = false;
    };
  }, [t]);

  const selectedAccount = bankAccounts.find(
    (acc) => String(acc.id ?? acc._id) === String(selectedAccountId)
  );

  function validate() {
    const numericAmount = Number(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      return t("cash.errors.invalidAmount");
    }
    if (!selectedAccountId) {
      return t("cash.errors.selectAccount");
    }
    if (!cashAccount) {
      return t("cash.errors.noCashAccount");
    }
    if (selectedAccount && numericAmount > selectedAccount.balance) {
      return t("cash.errors.insufficientBalance");
    }
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const res = await transferFunds({
        fromId: selectedAccountId,
        toId: cashAccount.id ?? cashAccount._id,
        amount: Number(amount),
        description: t("cash.withdrawDescription"), 
      });

      setSuccess(true);
      setAmount("");

      if (onSuccess) {
        onSuccess(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || t("cash.errors.generic"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg rounded-3xl bg-white p-8 shadow-sm shadow-slate-200 ring-1 ring-slate-100">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <Landmark size={22} />
        </span>
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">
            {t("cash.withdrawTitle")}
          </h2>
          <p className="text-sm text-slate-500">{t("cash.withdrawSubtitle")}</p>
        </div>
      </div>

      {loadingAccounts ? (
        <div className="mt-6 flex items-center gap-2 text-slate-500">
          <Loader2 size={18} className="animate-spin" />
          <span>{t("common.loading")}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* اختيار الحساب البنكي المصدر */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              {t("cash.bankAccount")}
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              {bankAccounts.map((acc) => (
                <option key={acc.id ?? acc._id} value={acc.id ?? acc._id}>
                  {acc.name} — {acc.balance?.toLocaleString()} {acc.currency || t("common.currency")}
                </option>
              ))}
            </select>
          </div>

          {/* المبلغ */}
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              {t("cash.amount")}
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="500"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>

         
          {cashAccount && (
            <p className="text-xs text-slate-400">
              {t("cash.willAddTo", { name: cashAccount.name })}
            </p>
          )}

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 ring-1 ring-red-100">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ring-1 ring-emerald-100">
              {t("cash.withdrawSuccess")}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting || !cashAccount}
              className="flex-1 rounded-xl bg-brand-600 py-2.5 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              {submitting ? t("common.processing") : t("cash.confirmWithdraw")}
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl bg-slate-100 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                {t("common.cancel")}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
