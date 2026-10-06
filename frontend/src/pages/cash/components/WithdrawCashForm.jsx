import { ArrowDownLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatAmount, currencyLabel } from "../../../utils/formatAmount";
import NumberInput from "../../../components/common/NumberInput";
import { inputClass } from "../constants";
import Select from "../../../components/common/Select";

function WithdrawCashForm({ handleSubmit, fromId, setFromId, toId, setToId, amount, setAmount, sourceAccounts, cashAccounts, requestError, transferStatus, status }) {
  const { t } = useTranslation();

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-5">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <ArrowDownLeft size={18} className="text-brand-600" /> {t("cash.withdrawTitle")}
        </div>
        <label className="block text-sm font-semibold text-slate-700">
          {t("cash.sourceAccount")}
          <Select required value={fromId} onChange={(event) => setFromId(event.target.value)} className={inputClass}>
            <option value="">{t("cash.selectAccount")}</option>
            {sourceAccounts.map((account) => (
              <option key={account._id} value={account._id}>
                {t("cash.accountOption", {
                  name: account.name,
                  balance: formatAmount(account.balance || 0),
                  currency: currencyLabel(account.currency),
                })}
              </option>
            ))}
          </Select>
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          {t("cash.cashAccount")}
          <Select required value={toId} onChange={(event) => setToId(event.target.value)} className={inputClass}>
            <option value="">{t("cash.selectCashAccount")}</option>
            {cashAccounts.map((account) => (
              <option key={account._id} value={account._id}>
                {t("cash.accountOption", {
                  name: account.name,
                  balance: formatAmount(account.balance || 0),
                  currency: currencyLabel(account.currency),
                })}
              </option>
            ))}
          </Select>
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          {t("cash.amount")}
          <NumberInput
            required
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className={inputClass}
          />
        </label>
        {requestError && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{requestError}</p>}
        <button
          type="submit"
          disabled={transferStatus === "loading" || status === "loading"}
          className="min-h-11 w-full rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white disabled:opacity-60"
        >
          {transferStatus === "loading" ? t("cash.submitting") : t("cash.confirmWithdraw")}
        </button>
      </form>
    </>
  );
}

export default WithdrawCashForm;
