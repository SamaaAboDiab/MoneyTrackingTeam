import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Banknote, ArrowDownLeft, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  createAccount,
  fetchAccounts,
  transferFunds,
} from "../../store/slices/accountsSlice";
import { formatAmount } from "../../utils/formatAmount";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-500";

function CashPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { items, status, error, transferStatus, transferError, createStatus, createError } = useSelector(
    (state) => state.accounts
  );
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [amount, setAmount] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  const activeAccounts = useMemo(
    () => items.filter((account) => account.isActive !== false && !account.isArchived),
    [items]
  );
  const sourceAccounts = useMemo(
    () => activeAccounts.filter((account) => account.type !== "cash"),
    [activeAccounts]
  );
  const cashAccounts = useMemo(
    () => activeAccounts.filter((account) => account.type === "cash"),
    [activeAccounts]
  );
  const cashBalance = cashAccounts.reduce((sum, account) => sum + Number(account.balance || 0), 0);

  async function handleCreateCashAccount() {
    setFormError("");
    try {
      const account = await dispatch(createAccount({ name: t("nav.cash"), type: "cash", balance: 0 })).unwrap();
      setToId(account._id);
    } catch {
      setFormError(createError || t("cash.createAccountError"));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const amountNumber = Number(amount);
    setFormError("");
    if (!fromId || !toId) {
      setFormError(t("cash.selectAccountsError"));
      return;
    }
    if (!amountNumber || amountNumber <= 0) {
      setFormError(t("cash.amountPositiveError"));
      return;
    }
    try {
      await dispatch(transferFunds({ fromId, toId, amount: amountNumber, description: t("cash.withdrawTitle") })).unwrap();
      setAmount("");
      await dispatch(fetchAccounts());
    } catch {
      // The Redux slice exposes the API error below the form.
    }
  }

  const requestError = formError || transferError || error || createError;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900"><Banknote className="text-brand-600" size={25} />{t("nav.cash")}</h1>
          <p className="mt-1 text-sm text-slate-500">{t("cash.subtitle")}</p>
        </div>
        <Link to="/dashboard" className="font-semibold text-brand-700 hover:underline">{t("common.backToDashboard")}</Link>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <p className="text-sm text-slate-500">{t("cash.totalBalance")}</p>
        <p className="mt-1 text-3xl font-extrabold text-slate-900">{formatAmount(cashBalance)} EGP</p>
      </div>

      {cashAccounts.length === 0 ? (
        <div className="rounded-2xl bg-amber-50 p-5 text-amber-800">
          <p className="font-semibold">{t("cash.noAccount")}</p>
          <button
            type="button"
            onClick={handleCreateCashAccount}
            disabled={createStatus === "loading"}
            className="mt-3 flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Plus size={16} /> {t("cash.createAccount")}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <ArrowDownLeft size={18} className="text-brand-600" /> {t("cash.withdrawTitle")}
          </div>
          <label className="block text-sm font-semibold text-slate-700">
            {t("cash.sourceAccount")}
            <select value={fromId} onChange={(event) => setFromId(event.target.value)} className={inputClass}>
              <option value="">{t("cash.selectAccount")}</option>
              {sourceAccounts.map((account) => (
                <option key={account._id} value={account._id}>
                  {t("cash.accountOption", {
                    name: account.name,
                    balance: formatAmount(account.balance || 0),
                    currency: account.currency,
                  })}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            {t("cash.cashAccount")}
            <select value={toId} onChange={(event) => setToId(event.target.value)} className={inputClass}>
              <option value="">{t("cash.selectCashAccount")}</option>
              {cashAccounts.map((account) => (
                <option key={account._id} value={account._id}>
                  {t("cash.accountOption", {
                    name: account.name,
                    balance: formatAmount(account.balance || 0),
                    currency: account.currency,
                  })}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            {t("cash.amount")}
            <input
              required
              min="0.01"
              step="0.01"
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className={inputClass}
            />
          </label>
          {requestError && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{requestError}</p>}
          <button
            disabled={transferStatus === "loading" || status === "loading"}
            className="w-full rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white disabled:opacity-60"
          >
            {transferStatus === "loading" ? t("cash.submitting") : t("cash.confirmWithdraw")}
          </button>
        </form>
      )}
    </div>
  );
}

export default CashPage;
