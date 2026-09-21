import { useMemo, useState } from "react";
import { ArrowDownLeft } from "lucide-react";
import { formatAmount } from "../../../utils/formatAmount";

const inputClass =
  "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500";
const labelClass = "text-sm font-semibold text-slate-700";

function WithdrawCashForm({ sourceAccounts, transferStatus, transferError, successMessage, onWithdraw, t }) {
  const [fromId, setFromId] = useState(sourceAccounts[0]?._id || "");
  const [amount, setAmount] = useState("");

  const selectedAccount = useMemo(
    () => sourceAccounts.find((account) => account._id === fromId),
    [sourceAccounts, fromId]
  );

  const numericAmount = Number(amount);
  const isValidAmount = amount !== "" && !Number.isNaN(numericAmount) && numericAmount > 0;

  const validationError = useMemo(() => {
    if (amount === "") return null;
    if (!isValidAmount) return t("cash.amountPositiveError");
    if (selectedAccount && numericAmount > Number(selectedAccount.balance)) {
      return t("cash.insufficientBalance");
    }
    return null;
  }, [amount, isValidAmount, numericAmount, selectedAccount, t]);

  if (sourceAccounts.length === 0) {
    return (
      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100">
        <p className="text-sm text-slate-500">{t("cash.noOtherAccounts")}</p>
      </section>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isValidAmount || validationError || !fromId) return;

    const result = await onWithdraw({ fromId, amount: numericAmount });
    if (result) {
      setAmount("");
    }
  };

  return (
    <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <ArrowDownLeft size={18} />
        </span>
        <div>
          <h2 className="text-lg font-bold text-slate-900">{t("cash.withdrawTitle")}</h2>
          <p className="text-xs text-slate-500">{t("cash.withdrawSubtitle")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cash-from" className={labelClass}>{t("cash.fromLabel")}</label>
          <select
            id="cash-from"
            value={fromId}
            onChange={(event) => setFromId(event.target.value)}
            required
            className={inputClass}
          >
            {sourceAccounts.map((account) => (
              <option key={account._id} value={account._id}>
                {account.name} — {formatAmount(account.balance)} {account.currency}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="cash-amount" className={labelClass}>{t("cash.amountLabel")}</label>
          <input
            id="cash-amount"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
            required
            className={inputClass}
          />
        </div>

        <div className="flex flex-col justify-end gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
          {(validationError || transferError) && (
            <p className="rounded-xl bg-expense-soft px-4 py-2.5 text-sm font-medium text-expense">
              {validationError || transferError}
            </p>
          )}
          {!validationError && successMessage && (
            <p className="rounded-xl bg-income-soft px-4 py-2.5 text-sm font-medium text-income">
              {successMessage}
            </p>
          )}
          <button
            type="submit"
            disabled={!isValidAmount || Boolean(validationError) || transferStatus === "loading"}
            className="ms-auto rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-65"
          >
            {transferStatus === "loading" ? t("cash.submitting") : t("cash.submit")}
          </button>
        </div>
      </form>
    </section>
  );
}

export default WithdrawCashForm;
