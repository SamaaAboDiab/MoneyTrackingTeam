import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Banknote } from "lucide-react";
import { formatAmount } from "../../utils/formatAmount";
import {
  fetchAccounts,
  createAccount,
  transferFunds,
  resetCreateAccountStatus,
  resetTransferStatus,
} from "../../store/slices/accountsSlice";
import CashBalanceCard from "./components/CashBalanceCard";
import WithdrawCashForm from "./components/WithdrawCashForm";

function CashPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const {
    items,
    status,
    createStatus,
    createError,
    transferStatus,
    transferError,
  } = useSelector((state) => state.accounts);

  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    dispatch(fetchAccounts());
    return () => {
      dispatch(resetCreateAccountStatus());
      dispatch(resetTransferStatus());
    };
  }, [dispatch]);

  const activeAccounts = items.filter((account) => !account.isArchived);
  const cashAccount = activeAccounts.find((account) => account.type === "cash");
  const sourceAccounts = activeAccounts.filter((account) => account.type !== "cash");

  const handleCreateCashAccount = async () => {
    await dispatch(
      createAccount({ name: t("cash.title"), type: "cash", balance: 0, currency: "EGP" })
    );
    dispatch(fetchAccounts());
  };

  const handleWithdraw = async ({ fromId, amount }) => {
    const result = await dispatch(
      transferFunds({
        fromId,
        toId: cashAccount._id,
        amount,
        description: t("cash.withdrawTitle"),
      })
    );

    if (transferFunds.fulfilled.match(result)) {
      setSuccessMessage(t("cash.success", { amount: `${formatAmount(amount)} EGP` }));
      setTimeout(() => setSuccessMessage(""), 4000);
      return true;
    }
    return false;
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{t("cash.title")}</h1>
          <p className="mt-1 text-slate-500">{t("cash.description")}</p>
        </div>

        <Link to="/dashboard" className="font-semibold text-brand-700 hover:underline">
          {t("common.backToDashboard")}
        </Link>
      </div>

      {status === "loading" && !cashAccount ? (
        <p className="mt-6 text-slate-500">{t("common.loading")}</p>
      ) : cashAccount ? (
        <>
          <div className="mt-6">
            <CashBalanceCard cashAccount={cashAccount} t={t} />
          </div>

          <WithdrawCashForm
            sourceAccounts={sourceAccounts}
            transferStatus={transferStatus}
            transferError={transferError}
            successMessage={successMessage}
            onWithdraw={handleWithdraw}
            t={t}
          />
        </>
      ) : (
        <section className="mt-6 rounded-2xl bg-white p-8 text-center shadow-sm shadow-slate-200 ring-1 ring-slate-100">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <Banknote size={26} />
          </span>
          <h2 className="mt-4 text-lg font-bold text-slate-900">{t("cash.noAccountTitle")}</h2>
          <p className="mt-1 text-slate-500">{t("cash.noAccountMessage")}</p>

          {createError && (
            <p className="mt-3 rounded-xl bg-expense-soft px-4 py-2.5 text-sm font-medium text-expense">
              {createError}
            </p>
          )}

          <button
            type="button"
            onClick={handleCreateCashAccount}
            disabled={createStatus === "loading"}
            className="mt-5 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-65"
          >
            {createStatus === "loading" ? t("cash.creating") : t("cash.createAccount")}
          </button>
        </section>
      )}
    </div>
  );
}

export default CashPage;
