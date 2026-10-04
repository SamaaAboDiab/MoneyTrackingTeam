import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Trash2, CheckCircle2, AlertTriangle } from "lucide-react";
import { getDebtPayments } from "../../api/debtsApi";
import { fetchAccounts } from "../../store/slices/accountsSlice";
import {
  fetchDebts,
  createDebtThunk,
  updateDebtThunk,
  deleteDebtThunk,
  markDebtPaidThunk,
  addDebtPaymentThunk,
} from "../../store/slices/debtsSlice";
import { formatAmount, formatMoney, currencyLabel } from "../../utils/formatAmount";
import ConfirmModal from "../../components/common/ConfirmModal";
import { getTodayString, EMPTY_DEBT_FORM } from "./constants";
import { getErrorMessage } from "./utils";
import DebtsHeader from "./components/DebtsHeader";
import DebtNotifications from "./components/DebtNotifications";
import DebtForm from "./components/DebtForm";
import DebtTabs from "./components/DebtTabs";
import DebtsList from "./components/DebtsList";
import PaymentModal from "./components/PaymentModal";

function DebtsPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { items: accounts } = useSelector((state) => state.accounts);
  const { items: debts, status: debtsLoadingStatus } = useSelector((state) => state.debts);

  const [error, setError] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Tabs: "active" | "completed" | "all"
  const [activeTab, setActiveTab] = useState("active");

  // New Debt Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [debtForm, setDebtForm] = useState(EMPTY_DEBT_FORM);
  const [savingDebt, setSavingDebt] = useState(false);
  const [editingDueDateId, setEditingDueDateId] = useState(null);
  const [editingDueDate, setEditingDueDate] = useState("");
  const [savingDueDate, setSavingDueDate] = useState(false);

  // Payment Modal state
  const [paymentModalDebt, setPaymentModalDebt] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    date: getTodayString(),
    accountId: "",
    notes: "",
  });
  const [savingPayment, setSavingPayment] = useState(false);
  const [balanceWarning, setBalanceWarning] = useState(false);

  // Expanded History state (debtId -> boolean) & history data (debtId -> array)
  const [expandedHistoryDebtId, setExpandedHistoryDebtId] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState({});
  const [loadingHistoryDebtId, setLoadingHistoryDebtId] = useState(null);

  // Active accounts for paying debts
  const activeAccounts = useMemo(
    () => accounts.filter((acc) => acc.isActive !== false && !acc.isArchived),
    [accounts]
  );

  // Separate active vs completed debts
  const activeDebts = useMemo(
    () =>
      debts.filter(
        (d) =>
          d.status !== "paid" &&
          (d.remainingAmount === undefined || d.remainingAmount > 0)
      ),
    [debts]
  );

  const completedDebts = useMemo(
    () =>
      debts.filter(
        (d) =>
          d.status === "paid" ||
          (d.remainingAmount !== undefined && d.remainingAmount <= 0)
      ),
    [debts]
  );

  const displayedDebts = useMemo(() => {
    if (activeTab === "active") return activeDebts;
    if (activeTab === "completed") return completedDebts;
    return debts;
  }, [activeTab, activeDebts, completedDebts, debts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchDebts());
      dispatch(fetchAccounts());
    }, 0);
    return () => clearTimeout(timer);
  }, [dispatch]);

  // Handle new debt form input
  function handleDebtFormChange({ target }) {
    setDebtForm((prev) => ({ ...prev, [target.name]: target.value }));
  }

  // Submit new debt
  async function handleCreateDebt(event) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (
      !debtForm.creditor.trim() ||
      !debtForm.totalAmount ||
      Number(debtForm.totalAmount) <= 0 ||
      !debtForm.currency ||
      !debtForm.startDate ||
      !debtForm.dueDate
    ) {
      setError(t("debts.createValidationError"));
      return;
    }

    setSavingDebt(true);
    try {
      await dispatch(
        createDebtThunk({
          ...debtForm,
          creditor: debtForm.creditor.trim(),
          totalAmount: Number(debtForm.totalAmount),
        })
      ).unwrap();

      setDebtForm({ ...EMPTY_DEBT_FORM, startDate: getTodayString() });
      setShowAddForm(false);
      setSuccessMessage(t("debts.createSuccess"));
      setActiveTab("active");
    } catch (requestError) {
      setError(getErrorMessage(requestError, t("debts.createError")));
    } finally {
      setSavingDebt(false);
    }
  }

  async function handleUpdateDueDate(debt, event) {
    event.preventDefault();
    if (!editingDueDate) return;
    setSavingDueDate(true);
    setError("");
    try {
      await dispatch(
        updateDebtThunk({ id: debt._id, payload: { dueDate: editingDueDate } })
      ).unwrap();
      setEditingDueDateId(null);
      setSuccessMessage(t("debts.dueDateUpdateSuccess"));
    } catch (requestError) {
      setError(getErrorMessage(requestError, t("debts.dueDateUpdateError")));
    } finally {
      setSavingDueDate(false);
    }
  }

  // Delete debt
  function handleDeleteDebt(id, e) {
    if (e) e.stopPropagation();
    setConfirmAction({ type: "delete", id });
  }

  async function performDeleteDebt(id) {
    try {
      await dispatch(deleteDebtThunk(id)).unwrap();
      if (expandedHistoryDebtId === id) setExpandedHistoryDebtId(null);
      setSuccessMessage(t("debts.deleteSuccess"));
    } catch (requestError) {
      setError(getErrorMessage(requestError, t("debts.deleteError")));
    }
  }

  // US-506: Mark debt as fully paid with confirmation
  function handleMarkPaid(debt, e) {
    if (e) e.stopPropagation();
    setConfirmAction({ type: "paid", debt });
  }

  async function performMarkPaid(debt) {
    try {
      await dispatch(markDebtPaidThunk(debt._id)).unwrap();
      setSuccessMessage(t("debts.markPaidSuccess", { creditor: debt.creditor }));
    } catch (requestError) {
      setError(getErrorMessage(requestError, t("debts.markPaidError")));
    }
  }

  async function runConfirmedAction() {
    const action = confirmAction;
    setConfirmAction(null);
    if (!action) return;
    if (action.type === "delete") await performDeleteDebt(action.id);
    if (action.type === "paid") await performMarkPaid(action.debt);
  }

  // Open Payment Modal
  function openPaymentModal(debt, e) {
    if (e) e.stopPropagation();
    setPaymentModalDebt(debt);
    setPaymentForm({
      amount: "",
      date: getTodayString(),
      accountId: activeAccounts[0]?._id || "",
      notes: "",
    });
    setError("");
  }

  // Submit Payment
  async function handleSavePayment(e) {
    e.preventDefault();
    if (!paymentModalDebt) return;

    const remaining = Number(
      paymentModalDebt.remainingAmount ??
        paymentModalDebt.totalAmount - paymentModalDebt.paidAmount
    );
    const amountNum = Number(paymentForm.amount);

    if (!amountNum || amountNum <= 0) {
      setError(t("debts.paymentAmountPositiveError"));
      return;
    }
    if (amountNum > remaining) {
      setError(
        t("debts.paymentExceedsRemainingError", {
          remaining: formatAmount(remaining),
          currency: currencyLabel(paymentModalDebt.currency),
        })
      );
      return;
    }
    if (!paymentForm.accountId) {
      setError(t("debts.paymentAccountRequiredError"));
      return;
    }
    if (!paymentForm.date) {
      setError(t("debts.paymentDateRequiredError"));
      return;
    }

    const account = activeAccounts.find(
      (acc) => String(acc._id) === String(paymentForm.accountId)
    );
    if (account && amountNum > Number(account.balance)) {
      setBalanceWarning(true);
      return;
    }

    await performPayment();
  }

  // Actually submit the debt payment (after validations and balance confirmation)
  async function performPayment() {
    const amountNum = Number(paymentForm.amount);

    setSavingPayment(true);
    setError("");
    try {
      await dispatch(
        addDebtPaymentThunk({
          id: paymentModalDebt._id,
          payload: {
            amount: amountNum,
            date: paymentForm.date,
            accountId: paymentForm.accountId,
            notes: paymentForm.notes.trim(),
          },
        })
      ).unwrap();

      // Automatically expand and refresh payment history from backend
      setExpandedHistoryDebtId(paymentModalDebt._id);
      await fetchHistory(paymentModalDebt._id);

      // Update account balance in Redux
      dispatch(fetchAccounts());

      setSuccessMessage(t("debts.paymentSuccess"));
      setPaymentModalDebt(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError, t("debts.paymentError")));
    } finally {
      setSavingPayment(false);
    }
  }

  // Fetch payment history directly from backend API
  async function fetchHistory(debtId) {
    setLoadingHistoryDebtId(debtId);
    try {
      const res = await getDebtPayments(debtId);
      setPaymentHistory((prev) => ({ ...prev, [debtId]: res.data.data || [] }));
    } catch (requestError) {
      setError(getErrorMessage(requestError, t("debts.historyFetchError")));
    } finally {
      setLoadingHistoryDebtId(null);
    }
  }

  // Toggle payment history view and fetch fresh from backend
  async function toggleHistory(debtId) {
    if (expandedHistoryDebtId === debtId) {
      setExpandedHistoryDebtId(null);
    } else {
      setExpandedHistoryDebtId(debtId);
      await fetchHistory(debtId);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <DebtsHeader
        showAddForm={showAddForm}
        setShowAddForm={setShowAddForm}
        setError={setError}
        setSuccessMessage={setSuccessMessage}
      />

      <DebtNotifications
        error={error}
        setError={setError}
        successMessage={successMessage}
        setSuccessMessage={setSuccessMessage}
      />

      <DebtForm
        showAddForm={showAddForm}
        setShowAddForm={setShowAddForm}
        debtForm={debtForm}
        handleDebtFormChange={handleDebtFormChange}
        handleCreateDebt={handleCreateDebt}
        savingDebt={savingDebt}
      />

      <DebtTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeDebts={activeDebts}
        completedDebts={completedDebts}
        debts={debts}
      />

      <DebtsList
        debtsLoadingStatus={debtsLoadingStatus}
        debts={debts}
        displayedDebts={displayedDebts}
        activeTab={activeTab}
        expandedHistoryDebtId={expandedHistoryDebtId}
        paymentHistory={paymentHistory}
        loadingHistoryDebtId={loadingHistoryDebtId}
        activeAccounts={activeAccounts}
        editingDueDateId={editingDueDateId}
        setEditingDueDateId={setEditingDueDateId}
        editingDueDate={editingDueDate}
        setEditingDueDate={setEditingDueDate}
        savingDueDate={savingDueDate}
        handleUpdateDueDate={handleUpdateDueDate}
        openPaymentModal={openPaymentModal}
        handleMarkPaid={handleMarkPaid}
        handleDeleteDebt={handleDeleteDebt}
        toggleHistory={toggleHistory}
      />

      <PaymentModal
        paymentModalDebt={paymentModalDebt}
        setPaymentModalDebt={setPaymentModalDebt}
        handleSavePayment={handleSavePayment}
        paymentForm={paymentForm}
        setPaymentForm={setPaymentForm}
        activeAccounts={activeAccounts}
        savingPayment={savingPayment}
      />

      <ConfirmModal
        isOpen={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        onConfirm={runConfirmedAction}
        icon={confirmAction?.type === "delete" ? Trash2 : CheckCircle2}
        title={t("debts.confirmTitle")}
        description={
          confirmAction?.type === "paid"
            ? t("debts.markPaidConfirm", { creditor: confirmAction.debt.creditor })
            : t("debts.deleteConfirm")
        }
        cancelLabel={t("debts.cancel")}
        confirmLabel={
          confirmAction?.type === "paid" ? t("debts.actions.markPaid") : t("debts.actions.delete")
        }
        confirmVariant={confirmAction?.type === "delete" ? "destructive" : "primary"}
      />

      <ConfirmModal
        isOpen={balanceWarning}
        onClose={() => setBalanceWarning(false)}
        onConfirm={async () => {
          setBalanceWarning(false);
          await performPayment();
        }}
        icon={AlertTriangle}
        confirmVariant="destructive"
        title={t("debts.insufficientBalance.title")}
        description={(() => {
          const account = activeAccounts.find(
            (acc) => String(acc._id) === String(paymentForm.accountId)
          );
          if (!account) return "";
          return t("debts.insufficientBalance.message", {
            account: account.name,
            balance: formatMoney(account.balance, account.currency),
            amount: formatMoney(Number(paymentForm.amount), account.currency),
          });
        })()}
        cancelLabel={t("debts.insufficientBalance.cancel")}
        confirmLabel={t("debts.insufficientBalance.confirm")}
      />

    </div>
  );
}

export default DebtsPage;
