import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  createAccount,
  fetchAccounts,
  transferFunds,
} from "../../store/slices/accountsSlice";
import { formatMoney } from "../../utils/formatAmount";
import CashHeader from "./components/CashHeader";
import CashBalanceCard from "./components/CashBalanceCard";
import NoCashAccount from "./components/NoCashAccount";
import WithdrawCashForm from "./components/WithdrawCashForm";

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
  // Cash balance per currency (largest first); different currencies are never added together.
  const cashTotals = Object.entries(
    cashAccounts.reduce((acc, account) => {
      const code = account.currency || "EGP";
      acc[code] = (acc[code] || 0) + Number(account.balance || 0);
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

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

    const fromAccount = sourceAccounts.find((account) => String(account._id) === String(fromId));
    if (fromAccount && amountNumber > Number(fromAccount.balance)) {
      setFormError(
        t("cash.insufficientBalance.message", {
          account: fromAccount.name,
          balance: formatMoney(fromAccount.balance, fromAccount.currency),
          amount: formatMoney(amountNumber, fromAccount.currency),
        })
      );
      return;
    }

    try {
      await dispatch(transferFunds({ fromId, toId, amount: amountNumber, description: t("cash.internalTransfer") })).unwrap();
      setAmount("");
      await dispatch(fetchAccounts());
    } catch {
      // The Redux slice exposes the API error below the form.
    }
  }

  const requestError = formError || transferError || error || createError;


  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <CashHeader />

      <CashBalanceCard cashTotals={cashTotals} hasCashAccount={cashAccounts.length > 0} />

      {cashAccounts.length === 0 ? (
        <NoCashAccount handleCreateCashAccount={handleCreateCashAccount} createStatus={createStatus} />
      ) : (
        <WithdrawCashForm
          handleSubmit={handleSubmit}
          fromId={fromId}
          setFromId={setFromId}
          toId={toId}
          setToId={setToId}
          amount={amount}
          setAmount={setAmount}
          sourceAccounts={sourceAccounts}
          cashAccounts={cashAccounts}
          requestError={requestError}
          transferStatus={transferStatus}
          status={status}
        />
      )}
    </div>
  );
}

export default CashPage;
