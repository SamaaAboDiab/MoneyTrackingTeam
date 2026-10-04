import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  clearIncomeCreateState,
  clearIncomeUpdateError,
  createIncomeEntry,
  deleteIncome,
  fetchIncomeSummary,
  fetchIncomes,
  updateIncomeEntry,
} from "../../store/slices/incomeSlice";
import { EMPTY_FORM, getCurrentMonth, getTodayString } from "./constants";
import { getAccounts } from "../../api/accountsApi";
import IncomeHeader from "./components/IncomeHeader";
import IncomeTotalCard from "./components/IncomeTotalCard";
import IncomeAlerts from "./components/IncomeAlerts";
import IncomeForm from "./components/IncomeForm";
import IncomeSummaryFilter from "./components/IncomeSummaryFilter";
import IncomeList from "./components/IncomeList";
import EditIncomeModal from "./components/EditIncomeModal";

function IncomePage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const {
    items,
    status,
    error,
    createStatus,
    createError,
    updateStatus,
    updateError,
    summary,
    summaryStatus,
    summaryError,
  } = useSelector((state) => state.incomes);

  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [successMessage, setSuccessMessage] = useState("");

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [summaryCurrency, setSummaryCurrency] = useState("EGP");

  const [createForm, setCreateForm] = useState({
    name: "",
    category: "",
    amount: "",
    currency: "EGP",
    receivedDate: getTodayString(),
    recurrence: "once",
    accountId: "",
    notes: "",
  });

  const [availableAccounts, setAvailableAccounts] = useState([]);

  // Fetch all incomes
  useEffect(() => {
    dispatch(fetchIncomes());
  }, [dispatch]);

  // Fetch accounts so income can optionally credit one of them
  const loadAccounts = () => {
    getAccounts()
      .then((res) => {
        const accs = res.data?.data || res.data || [];
        setAvailableAccounts(
          Array.isArray(accs) ? accs.filter((acc) => !acc.isArchived && acc.isActive !== false) : []
        );
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  // Fetch monthly income summary
  useEffect(() => {
    const [year, month] = selectedMonth.split("-").map(Number);

    dispatch(
      fetchIncomeSummary({
        year,
        month: month - 1,
        currency: summaryCurrency,
      })
    );
  }, [dispatch, selectedMonth, summaryCurrency]);

  // Clear update error after 3 seconds
  useEffect(() => {
    if (!updateError) return;

    const timer = setTimeout(() => {
      dispatch(clearIncomeUpdateError());
    }, 3000);

    return () => clearTimeout(timer);
  }, [updateError, dispatch]);

  // Clear create state after 3 seconds
  useEffect(() => {
    if (createStatus !== "succeeded") return;

    const timer = setTimeout(() => {
      dispatch(clearIncomeCreateState());
    }, 3000);

    return () => clearTimeout(timer);
  }, [createStatus, dispatch]);

  // Calculate total income from all income items
  const totalIncome = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      ),
    [items]
  );

  const summaryItems = summary?.items || items;
  const displayedTotal = summary?.total ?? totalIncome;

  // Refresh summary after create/update/delete
  const refreshSummary = () => {
    const [year, month] = selectedMonth.split("-").map(Number);

    dispatch(
      fetchIncomeSummary({
        year,
        month: month - 1,
        currency: summaryCurrency,
      })
    );
  };

  // Open edit modal
  const openEditModal = (income) => {
    setSelectedId(income._id);

    setForm({
      name: income.name || "",
      category: income.category || "salary",
      amount: income.amount ?? "",
      currency: income.currency || "EGP",
      receivedDate: income.receivedDate
        ? new Date(income.receivedDate).toISOString().slice(0, 10)
        : getTodayString(),
      recurrence: income.recurrence || "once",
      status: income.status || "cleared",
      accountId: income.account?._id || income.account || "",
      notes: income.notes || "",
    });

    setIsEditing(true);
    setSuccessMessage("");
  };

  // Close edit modal
  const closeEditModal = () => {
    setIsEditing(false);
    setSelectedId(null);
    setForm(EMPTY_FORM);
  };

  // Edit form change
  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Create form change
  const handleCreateChange = (event) => {
    const { name, value } = event.target;

    setCreateForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Create income
  const handleCreateSubmit = async (event) => {
    event.preventDefault();

    const result = await dispatch(
      createIncomeEntry({
        ...createForm,
        name: createForm.name.trim(),
        amount: Number(createForm.amount),
        notes: createForm.notes.trim(),
      })
    );

    if (createIncomeEntry.fulfilled.match(result)) {
      setCreateForm({
        name: "",
        category: "",
        amount: "",
        currency: "EGP",
        receivedDate: getTodayString(),
        recurrence: "once",
        accountId: "",
        notes: "",
      });

      dispatch(fetchIncomes());
      refreshSummary();
      loadAccounts();
    }
  };

  // Update income
  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      name: form.name.trim(),
      category: form.category,
      amount: Number(form.amount),
      currency: form.currency,
      receivedDate: form.receivedDate,
      recurrence: form.recurrence,
      status: form.status,
      accountId: form.accountId || null,
      notes: form.notes.trim(),
    };

    const result = await dispatch(
      updateIncomeEntry({
        id: selectedId,
        payload,
      })
    );

    if (updateIncomeEntry.fulfilled.match(result)) {
      setSuccessMessage(t("income.updateSuccess"));

      closeEditModal();

      dispatch(fetchIncomes());
      refreshSummary();
      loadAccounts();
    }
  };

  // Delete income
  const handleDeleteIncome = async (id) => {
    await dispatch(deleteIncome(id)).unwrap();

    dispatch(fetchIncomes());
    refreshSummary();
    loadAccounts();
  };


  return (
    <div className="mx-auto max-w-6xl">
      <IncomeHeader />

      <IncomeTotalCard
        displayedTotal={displayedTotal}
        summaryCurrency={summaryCurrency}
        summaryStatus={summaryStatus}
        summaryError={summaryError}
      />

      <IncomeAlerts error={error} updateError={updateError} successMessage={successMessage} />

      <IncomeForm
        form={createForm}
        createStatus={createStatus}
        createError={createError}
        onChange={handleCreateChange}
        onSubmit={handleCreateSubmit}
        availableAccounts={availableAccounts}
        t={t}
      />


      <IncomeSummaryFilter
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        summaryCurrency={summaryCurrency}
        setSummaryCurrency={setSummaryCurrency}
      />

      <IncomeList
        items={summaryItems}
        status={summary ? summaryStatus : status}
        error={error}
        displayCurrency={summaryCurrency}
        totalAmount={displayedTotal}
        onEdit={openEditModal}
        onDeleted={handleDeleteIncome}
        onToggled={refreshSummary}
        t={t}
      />


      <EditIncomeModal
        isEditing={isEditing}
        closeEditModal={closeEditModal}
        handleSubmit={handleSubmit}
        form={form}
        handleFormChange={handleFormChange}
        updateStatus={updateStatus}
        availableAccounts={availableAccounts}
      />
    </div>
  );
}

export default IncomePage;
