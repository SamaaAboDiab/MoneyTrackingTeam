import { ArrowDownLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatAmount } from "../../../utils/formatAmount";
import { inputClass } from "../constants";

function WithdrawCashForm({ handleSubmit, fromId, setFromId, toId, setToId, amount, setAmount, sourceAccounts, cashAccounts, requestError, transferStatus, status }) {
  const { t } = useTranslation();

  return (
    <>
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
    </>
  );
}

export default WithdrawCashForm;
