import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  CreditCard,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  History,
  ChevronDown,
  ChevronUp,
  X,
  Wallet,
  Calendar,
  Check,
} from "lucide-react";
import {
  getDebtPayments,
} from "../../api/debtsApi";
import { fetchAccounts } from "../../store/slices/accountsSlice";
import {
  fetchDebts,
  createDebtThunk,
  updateDebtThunk,
  deleteDebtThunk,
  markDebtPaidThunk,
  addDebtPaymentThunk,
} from "../../store/slices/debtsSlice";
import { formatAmount } from "../../utils/formatAmount";

const getTodayString = () => new Date().toISOString().split("T")[0];

const EMPTY_DEBT_FORM = {
  creditor: "",
  totalAmount: "",
  currency: "EGP",
  startDate: getTodayString(),
  dueDate: "",
  category: "other",
  description: "",
};

const CATEGORY_KEYS = ["other", "personal", "credit_card", "auto_loan", "mortgage", "student"];
const CURRENCY_KEYS = ["EGP", "USD", "EUR", "SAR", "AED"];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500";
const labelClass = "block text-sm font-semibold text-slate-700 mb-1";

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || error?.message || fallback;
}

function isOverdue(debt) {
  if (debt.status === "paid") return false;
  if (debt.status === "overdue") return true;
  if (!debt.dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(debt.dueDate) < today;
}

function isDueSoon(debt) {
  if (debt.status === "paid" || isOverdue(debt) || !debt.dueDate) return false;
  const daysUntilDue = getDaysUntilDue(debt.dueDate);
  return daysUntilDue >= 0 && daysUntilDue <= 7;
}

function getDaysUntilDue(dateString) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dateString);
  dueDate.setHours(0, 0, 0, 0);
  return Math.ceil((dueDate - today) / 86400000);
}

function DebtsPage() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { items: accounts } = useSelector((state) => state.accounts);
  const { items: debts, status: debtsLoadingStatus } = useSelector((state) => state.debts);

  const [error, setError] = useState("");
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

  // Expanded History state (debtId -> boolean) & history data (debtId -> array)
  const [expandedHistoryDebtId, setExpandedHistoryDebtId] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState({});
  const [loadingHistoryDebtId, setLoadingHistoryDebtId] = useState(null);

  function formatDate(dateString) {
    if (!dateString) return "—";
    try {
      const d = new Date(dateString);
      return Number.isNaN(d.getTime())
        ? dateString
        : d.toLocaleDateString(i18n.language, {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
    } catch {
      return dateString;
    }
  }

  function getDueSoonMessage(dateString) {
    const daysUntilDue = getDaysUntilDue(dateString);
    if (daysUntilDue === 0) return t("debts.dueSoonMessage.today");
    if (daysUntilDue === 1) return t("debts.dueSoonMessage.tomorrow");
    return t("debts.dueSoonMessage.inDays", { count: daysUntilDue });
  }

  const categoryLabel = (category) => t(`debts.category.${category || "other"}`);

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
  async function handleDeleteDebt(id, e) {
    if (e) e.stopPropagation();
    if (!window.confirm(t("debts.deleteConfirm"))) return;
    try {
      await dispatch(deleteDebtThunk(id)).unwrap();
      if (expandedHistoryDebtId === id) setExpandedHistoryDebtId(null);
      setSuccessMessage(t("debts.deleteSuccess"));
    } catch (requestError) {
      setError(getErrorMessage(requestError, t("debts.deleteError")));
    }
  }

  // US-506: Mark debt as fully paid with confirmation
  async function handleMarkPaid(debt, e) {
    if (e) e.stopPropagation();
    const confirmed = window.confirm(t("debts.markPaidConfirm", { creditor: debt.creditor }));
    if (!confirmed) return;

    try {
      await dispatch(markDebtPaidThunk(debt._id)).unwrap();
      setSuccessMessage(t("debts.markPaidSuccess", { creditor: debt.creditor }));
    } catch (requestError) {
      setError(getErrorMessage(requestError, t("debts.markPaidError")));
    }
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
          currency: paymentModalDebt.currency,
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
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900">
            <CreditCard className="text-brand-600" size={26} />
            {t("nav.debts")}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {t("debts.subtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowAddForm((prev) => !prev);
            setError("");
            setSuccessMessage("");
          }}
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          <Plus size={18} />
          {showAddForm ? t("debts.cancel") : t("debts.addNew")}
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center justify-between rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700 ring-1 ring-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError("")}
            className="text-red-500 hover:text-red-700"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            className="text-emerald-600 hover:text-emerald-800"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* US-501: Add Debt Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateDebt}
          className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80"
        >
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900">{t("debts.form.title")}</h2>
            <span className="text-xs text-slate-400">{t("debts.form.requiredNote")}</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>
                {t("debts.form.creditorLabel")} <span className="text-red-500">*</span>
              </label>
              <input
                required
                name="creditor"
                placeholder={t("debts.form.creditorPlaceholder")}
                value={debtForm.creditor}
                onChange={handleDebtFormChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                {t("debts.form.totalAmountLabel")} <span className="text-red-500">*</span>
              </label>
              <input
                required
                min="0.01"
                step="0.01"
                type="number"
                name="totalAmount"
                placeholder="0.00"
                value={debtForm.totalAmount}
                onChange={handleDebtFormChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                {t("debts.form.currencyLabel")} <span className="text-red-500">*</span>
              </label>
              <select
                required
                name="currency"
                value={debtForm.currency}
                onChange={handleDebtFormChange}
                className={inputClass}
              >
                {CURRENCY_KEYS.map((code) => (
                  <option key={code} value={code}>{t(`debts.currencyOptions.${code}`)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>
                {t("debts.form.categoryLabel")}
              </label>
              <select
                name="category"
                value={debtForm.category}
                onChange={handleDebtFormChange}
                className={inputClass}
              >
                {CATEGORY_KEYS.map((key) => (
                  <option key={key} value={key}>{categoryLabel(key)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>
                {t("debts.form.startDateLabel")} <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="date"
                name="startDate"
                value={debtForm.startDate}
                onChange={handleDebtFormChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                {t("debts.form.dueDateLabel")} <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="date"
                name="dueDate"
                value={debtForm.dueDate}
                onChange={handleDebtFormChange}
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>{t("debts.form.notesLabel")}</label>
              <textarea
                name="description"
                rows={2}
                placeholder={t("debts.form.notesPlaceholder")}
                value={debtForm.description}
                onChange={handleDebtFormChange}
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              {t("debts.cancel")}
            </button>
            <button
              type="submit"
              disabled={savingDebt}
              className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
            >
              {savingDebt ? t("debts.form.saving") : t("debts.form.save")}
            </button>
          </div>
        </form>
      )}

      {/* US-506: Navigation Tabs (Active vs Completed vs All) */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("active")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition ${
            activeTab === "active"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <span>{t("debts.tabs.active")}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-bold ${
              activeTab === "active"
                ? "bg-brand-100 text-brand-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {activeDebts.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("completed")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition ${
            activeTab === "completed"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <span>{t("debts.tabs.completed")}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-bold ${
              activeTab === "completed"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {completedDebts.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition ${
            activeTab === "all"
              ? "border-slate-800 text-slate-800"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <span>{t("debts.tabs.all")}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-bold ${
              activeTab === "all"
                ? "bg-slate-200 text-slate-800"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {debts.length}
          </span>
        </button>
      </div>

      {/* Debts List */}
      {debtsLoadingStatus === "loading" && debts.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center text-slate-500 shadow-sm ring-1 ring-slate-100">
          {t("debts.loading")}
        </div>
      ) : displayedDebts.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center text-slate-500 shadow-sm ring-1 ring-slate-100">
          <CreditCard className="mx-auto mb-3 text-slate-300" size={42} />
          <p className="text-base font-semibold text-slate-700">
            {activeTab === "active"
              ? t("debts.empty.activeTitle")
              : activeTab === "completed"
              ? t("debts.empty.completedTitle")
              : t("debts.empty.allTitle")}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {activeTab === "active"
              ? t("debts.empty.activeSubtitle")
              : t("debts.empty.otherSubtitle")}
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {displayedDebts.map((debt) => {
            const isPaid =
              debt.status === "paid" ||
              (debt.remainingAmount !== undefined && debt.remainingAmount <= 0) ||
              (debt.paidAmount !== undefined && debt.paidAmount >= debt.totalAmount);
            const remaining = isPaid
              ? 0
              : Number(debt.remainingAmount ?? debt.totalAmount - (debt.paidAmount || 0));
            const progress = isPaid
              ? 100
              : Math.min(
                  100,
                  Math.max(
                    0,
                    Number(
                      debt.progressPct ??
                        (debt.totalAmount > 0
                          ? ((debt.paidAmount || 0) / debt.totalAmount) * 100
                          : 0)
                    )
                  )
                );
            const overdue = isOverdue(debt);
            const dueSoon = isDueSoon(debt);
            const isExpanded = expandedHistoryDebtId === debt._id;
            const history = paymentHistory[debt._id] || [];

            return (
              <article
                key={debt._id}
                className={`overflow-hidden rounded-2xl bg-white shadow-sm transition-all ${
                  isPaid
                    ? "border border-emerald-200/80 bg-emerald-50/20 ring-1 ring-emerald-100"
                    : overdue
                    ? "border-2 border-red-500 ring-2 ring-red-100"
                    : "border border-slate-200/90 ring-1 ring-slate-100"
                }`}
              >
                {/* Overdue banner indicator */}
                {overdue && (
                  <div className="flex items-center gap-1.5 bg-red-600 px-5 py-1.5 text-xs font-bold text-white">
                    <AlertCircle size={14} />
                    <span>{t("debts.overdueBanner")}</span>
                  </div>
                )}

                <div className="p-5">
                  {/* Card Header */}
                  <div
                    className="flex cursor-pointer flex-wrap items-start justify-between gap-3"
                    onClick={() => toggleHistory(debt._id)}
                  >
                    <div>
                      <div className="flex items-center gap-2.5">
                        {/* US-506: Completed debts have strikethrough and green checkmark icon */}
                        {isPaid && (
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <Check size={16} strokeWidth={3} />
                          </span>
                        )}

                        <h2
                          className={`text-lg font-bold ${
                            isPaid
                              ? "text-slate-400 line-through"
                              : "text-slate-900"
                          }`}
                        >
                          {debt.creditor}
                        </h2>

                        {isPaid ? (
                          <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                            <CheckCircle2 size={13} /> {t("debts.status.paid")}
                          </span>
                        ) : overdue ? (
                          <span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
                            <AlertCircle size={12} /> {t("debts.status.overdue")}
                          </span>
                        ) : (
                          <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            dueSoon ? "bg-orange-100 text-orange-700" : "bg-amber-100 text-amber-700"
                          }`}>
                            <Clock size={12} /> {dueSoon ? t("debts.status.dueSoon") : t("debts.status.active")}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-slate-500">
                        {categoryLabel(debt.category)}
                        {debt.description ? ` • ${debt.description}` : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="text-xs text-slate-500">{t("debts.clickForHistory")}</span>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {/* US-503 & US-506: Amounts & Progress */}
                  <div
                    onClick={() => toggleHistory(debt._id)}
                    className="mt-4 grid cursor-pointer grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3.5 text-center transition hover:bg-slate-100 sm:gap-4"
                  >
                    <div>
                      <p className="text-xs text-slate-500">{t("debts.amounts.original")}</p>
                      <p
                        className={`mt-0.5 text-sm font-bold sm:text-base ${
                          isPaid ? "text-slate-400 line-through" : "text-slate-900"
                        }`}
                      >
                        {formatAmount(debt.totalAmount)} {debt.currency}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">{t("debts.amounts.paid")}</p>
                      <p className="mt-0.5 text-sm font-bold text-emerald-600 sm:text-base">
                        {formatAmount(debt.paidAmount || (isPaid ? debt.totalAmount : 0))} {debt.currency}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">{t("debts.amounts.remaining")}</p>
                      <p
                        className={`mt-0.5 text-sm font-bold sm:text-base ${
                          isPaid
                            ? "text-emerald-600"
                            : overdue
                            ? "text-red-600"
                            : "text-amber-600"
                        }`}
                      >
                        {formatAmount(remaining)} {debt.currency}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="mb-1.5 flex justify-between text-xs font-semibold text-slate-600">
                      <span>{t("debts.progressLabel")}</span>
                      <span className={isPaid ? "text-emerald-700 font-bold" : ""}>
                        {isPaid ? t("debts.progressComplete") : `${Math.round(progress)}%`}
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isPaid
                            ? "bg-emerald-500"
                            : overdue
                            ? "bg-red-500"
                            : "bg-brand-600"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* US-503: Dates Details */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400" />
                      <span>{t("debts.startDatePrefix")}</span>
                      <strong className="text-slate-700">{formatDate(debt.startDate)}</strong>
                    </div>

                    {dueSoon && (
                      <div className="flex items-center gap-1.5 font-bold text-orange-600">
                        <AlertCircle size={14} />
                        <span>{getDueSoonMessage(debt.dueDate)}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      <Calendar
                        size={14}
                        className={overdue ? "text-red-500" : "text-slate-400"}
                      />
                      <span>{t("debts.dueDatePrefix")}</span>
                      <strong className={overdue ? "font-bold text-red-600" : "text-slate-700"}>
                        {formatDate(debt.dueDate)}
                      </strong>
                    </div>
                  </div>

                  <div className="mt-3 border-t border-slate-100 pt-3">
                    {editingDueDateId === debt._id ? (
                      <form onSubmit={(event) => handleUpdateDueDate(debt, event)} className="flex flex-wrap items-end gap-2">
                        <div>
                          <label className={labelClass}>{t("debts.editDueDate")}</label>
                          <input
                            required
                            type="date"
                            value={editingDueDate}
                            onChange={(event) => setEditingDueDate(event.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <button type="submit" disabled={savingDueDate} className="rounded-xl bg-brand-600 px-3.5 py-2.5 text-xs font-semibold text-white disabled:opacity-60">
                          {savingDueDate ? t("debts.form.saving") : t("debts.saveDate")}
                        </button>
                        <button type="button" onClick={() => setEditingDueDateId(null)} className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-600">
                          {t("debts.cancel")}
                        </button>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDueDateId(debt._id);
                          setEditingDueDate(debt.dueDate ? new Date(debt.dueDate).toISOString().split("T")[0] : "");
                        }}
                        className="text-xs font-semibold text-brand-600 hover:underline"
                      >
                        {t("debts.editDueDate")}
                      </button>
                    )}
                  </div>

                  {/* US-504: Payment-rate forecast */}
                  {!isPaid && (
                    <div className="mt-3 rounded-xl bg-brand-50 px-3.5 py-3 text-sm text-brand-800">
                      {debt.paymentForecast?.status === "available" ? (
                        <>
                          <p className="font-semibold">{debt.paymentForecast.message}</p>
                          <p className="mt-1 text-xs text-brand-700">
                            {t("debts.forecast.averageMonthly", {
                              amount: `${formatAmount(debt.paymentForecast.averageMonthlyPayment)} ${debt.currency}`,
                            })}
                          </p>
                        </>
                      ) : (
                        <p className="font-semibold">{t("debts.forecast.notEnoughData")}</p>
                      )}
                    </div>
                  )}

                  {/* US-502 & US-506 Actions: زرار "تم السداد" على كل دين نشط */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                    <div className="flex flex-wrap gap-2">
                      {!isPaid && (
                        <button
                          type="button"
                          onClick={(e) => openPaymentModal(debt, e)}
                          className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700"
                        >
                          <Plus size={15} /> {t("debts.actions.addPayment")}
                        </button>
                      )}

                      {/* US-506: زرار "تم السداد" على كل دين نشط */}
                      {!isPaid && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkPaid(debt, e)}
                          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                        >
                          <CheckCircle2 size={15} /> {t("debts.actions.markPaid")}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleHistory(debt._id)}
                        className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                      >
                        <History size={15} />
                        {isExpanded ? t("debts.actions.hideHistory") : t("debts.actions.showHistory")}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteDebt(debt._id, e)}
                      className="flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                    >
                      <Trash2 size={14} /> {t("debts.actions.delete")}
                    </button>
                  </div>
                </div>

                {/* US-503: Payment History Section */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50/70 p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                        <History size={16} className="text-brand-600" />
                        {t("debts.history.title", { count: history.length })}
                      </h3>
                      {!isPaid && (
                        <button
                          type="button"
                          onClick={(e) => openPaymentModal(debt, e)}
                          className="text-xs font-semibold text-brand-600 hover:underline"
                        >
                          {t("debts.history.addNew")}
                        </button>
                      )}
                    </div>

                    {loadingHistoryDebtId === debt._id ? (
                      <p className="py-4 text-center text-xs font-medium text-slate-500">
                        {t("debts.history.loading")}
                      </p>
                    ) : history.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
                        {t("debts.history.empty")}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {history.map((payment) => (
                          <div
                            key={payment._id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-xs"
                          >
                            <div className="flex items-center gap-3">
                              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                                ✓
                              </span>
                              <div>
                                <p className="font-bold text-slate-900">
                                  {formatAmount(payment.amount)} {debt.currency}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {formatDate(payment.date)}
                                  {payment.notes ? ` • ${payment.notes}` : ""}
                                </p>
                              </div>
                            </div>

                            {payment.accountId && (
                              <div className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                                <Wallet size={13} className="text-slate-400" />
                                <span>
                                  {typeof payment.accountId === "object"
                                    ? payment.accountId.name
                                    : activeAccounts.find((a) => a._id === payment.accountId)
                                        ?.name || t("debts.history.unknownAccount")}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* US-502: Add Payment Modal */}
      {paymentModalDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{t("debts.paymentModal.title")}</h2>
                <p className="text-xs text-slate-500">
                  {t("debts.paymentModal.payingFor")} <strong>{paymentModalDebt.creditor}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPaymentModalDebt(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-4 rounded-xl bg-amber-50 p-3 text-xs font-medium text-amber-800">
              {t("debts.paymentModal.remainingLabel")}{" "}
              <strong>
                {formatAmount(
                  paymentModalDebt.remainingAmount ??
                    paymentModalDebt.totalAmount - paymentModalDebt.paidAmount
                )}{" "}
                {paymentModalDebt.currency}
              </strong>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-4">
              <div>
                <label className={labelClass}>
                  {t("debts.paymentModal.amountLabel")} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={Number(
                    paymentModalDebt.remainingAmount ??
                      paymentModalDebt.totalAmount - paymentModalDebt.paidAmount
                  )}
                  placeholder="0.00"
                  value={paymentForm.amount}
                  onChange={(e) =>
                    setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  {t("debts.paymentModal.dateLabel")} <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="date"
                  value={paymentForm.date}
                  onChange={(e) =>
                    setPaymentForm((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  {t("debts.paymentModal.accountLabel")} <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={paymentForm.accountId}
                  onChange={(e) =>
                    setPaymentForm((prev) => ({ ...prev, accountId: e.target.value }))
                  }
                  className={inputClass}
                >
                  <option value="">{t("debts.paymentModal.selectAccount")}</option>
                  {activeAccounts.map((account) => (
                    <option key={account._id} value={account._id}>
                      {t("debts.paymentModal.accountOption", {
                        name: account.name,
                        balance: formatAmount(account.balance || 0),
                        currency: account.currency,
                      })}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-slate-500">
                  {t("debts.paymentModal.accountHint")}
                </p>
              </div>

              <div>
                <label className={labelClass}>{t("debts.paymentModal.notesLabel")}</label>
                <input
                  type="text"
                  placeholder={t("debts.paymentModal.notesPlaceholder")}
                  value={paymentForm.notes}
                  onChange={(e) =>
                    setPaymentForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalDebt(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  {t("debts.paymentModal.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={savingPayment}
                  className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
                >
                  {savingPayment ? t("debts.paymentModal.saving") : t("debts.paymentModal.confirm")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer link */}
      <div>
        <Link
          to="/dashboard"
          className="inline-block font-semibold text-brand-700 hover:underline"
        >
          {t("common.backToDashboard")}
        </Link>
      </div>
    </div>
  );
}

export default DebtsPage;
