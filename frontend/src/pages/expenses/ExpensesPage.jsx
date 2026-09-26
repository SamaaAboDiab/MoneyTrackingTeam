import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  createExpenseEntry,
  fetchExpenses,
  resetExpenseCreateStatus,
  updateExpenseEntry,
  deleteExpenseEntry,
} from "../../store/slices/expensesSlice";
import { getAccounts } from "../../api/accountsApi";
import { listCategories } from "../../api/categoryApi";
import { EMPTY_FORM, EMPTY_FILTERS, FALLBACK_CATEGORY_COLORS } from "./constants";
import ExpenseToast from "./components/ExpenseToast";
import ExpensesSummary from "./components/ExpensesSummary";
import ExpenseForm from "./components/ExpenseForm";
import ExpenseFilters from "./components/ExpenseFilters";
import ExpensesList from "./components/ExpensesList";
import EditExpenseModal from "./components/EditExpenseModal";
import DeleteExpenseModal from "./components/DeleteExpenseModal";

function ExpensesPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { items, status, createStatus, createError } = useSelector((state) => state.expenses);
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState(EMPTY_FORM);
  const [filters, setFilters] = useState(() => {
    const categoryFromUrl = searchParams.get("category");
    return categoryFromUrl ? { ...EMPTY_FILTERS, category: categoryFromUrl } : EMPTY_FILTERS;
  });

  // البيانات الديناميكية من الـ API (ليست استاتيك)
  const [availableAccounts, setAvailableAccounts] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);

  // حالات التعديل والحذف وتنبيهات النجاح
  const [editingExpense, setEditingExpense] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const [deletingExpense, setDeletingExpense] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4500);
  };

  // جلب الحسابات من GET /api/accounts
  const loadAccounts = useCallback(() => {
    getAccounts()
      .then((res) => {
        const accs = res.data?.data || res.data || [];
        setAvailableAccounts(
          Array.isArray(accs) ? accs.filter((acc) => !acc.isArchived && acc.isActive !== false) : []
        );
      })
      .catch(() => {});
  }, []);

  // جلب التصنيفات من GET /api/expense-categories
  const loadCategories = useCallback(() => {
    listCategories()
      .then((cats) => {
        setAvailableCategories(Array.isArray(cats) ? cats : []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadAccounts();
    loadCategories();
  }, [loadAccounts, loadCategories]);

  // دالة تحويل أي قيمة فئة (سواء كانت ID أو اسم) إلى اسم الفئة الفعلي المضاف
  const getCategoryName = useCallback(
    (categoryValue) => {
      if (!categoryValue) return "—";
      // البحث بالـ _id
      const byId = availableCategories.find(
        (c) => String(c._id) === String(categoryValue)
      );
      if (byId) return byId.name;

      // البحث بالاسم
      const byName = availableCategories.find(
        (c) => c.name === categoryValue
      );
      if (byName) return byName.name;

      return categoryValue;
    },
    [availableCategories]
  );

  // دالة تحويل أي قيمة فئة إلى لونها المخصص
  const getCategoryColor = useCallback(
    (categoryValue) => {
      if (!categoryValue) return "#6b7280";
      // البحث بالـ _id
      const byId = availableCategories.find(
        (c) => String(c._id) === String(categoryValue)
      );
      if (byId) return byId.color || FALLBACK_CATEGORY_COLORS[byId.name] || "#6b7280";

      // البحث بالاسم
      const byName = availableCategories.find(
        (c) => c.name === categoryValue
      );
      if (byName) return byName.color || FALLBACK_CATEGORY_COLORS[byName.name] || "#6b7280";

      // fallback للتصنيفات الافتراضية
      return FALLBACK_CATEGORY_COLORS[categoryValue] || "#6b7280";
    },
    [availableCategories]
  );

  // جلب المصروفات مع الفلاتر من GET /api/expenses
  const refetchExpenses = useCallback(() => {
    const params = {};
    if (filters.period && filters.period !== "all") params.period = filters.period;
    if (filters.period === "custom") {
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
    }
    if (filters.type && filters.type !== "all") params.type = filters.type;
    if (filters.category && filters.category !== "all") params.category = filters.category;
    if (filters.account && filters.account !== "all") params.account = filters.account;

    dispatch(fetchExpenses(params));
  }, [filters, dispatch]);

  useEffect(() => {
    refetchExpenses();
  }, [refetchExpenses]);

  useEffect(() => {
    return () => dispatch(resetExpenseCreateStatus());
  }, [dispatch]);

  const totalExpenses = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [items]
  );

  const handleChange = ({ target }) => {
    const { name, value } = target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = ({ target }) => {
    const { name, value } = target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = ({ target }) => {
    const { name, value } = target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
  };

  const isFiltered =
    filters.period !== "all" ||
    filters.type !== "all" ||
    filters.category !== "all" ||
    filters.account !== "all";

  // إضافة مصروف جديد
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.expenseType || !form.category) {
      return;
    }

    // التأكد من إرسال اسم التصنيف وليس ID
    const catName = getCategoryName(form.category);

    const payload = {
      description: form.description.trim(),
      amount: Number(form.amount),
      date: form.date,
      paymentMethod: form.paymentMethod,
      expenseType: form.expenseType,
      category: catName,
      notes: form.notes.trim(),
      currency: "EGP",
      status: "confirmed",
    };

    if (form.accountId) {
      payload.accountId = form.accountId;
    }

    const result = await dispatch(createExpenseEntry(payload));

    if (createExpenseEntry.fulfilled.match(result)) {
      setForm({ ...EMPTY_FORM, date: new Date().toISOString().slice(0, 10) });
      showToast(t("expenses.toast.added"));
      loadAccounts();
      loadCategories();
      refetchExpenses();
    }
  };

  // فتح فورم التعديل بالبيانات القديمة
  const openEditModal = (expense) => {
    setEditingExpense(expense);
    const resolvedCat = getCategoryName(expense.category);
    setEditForm({
      description: expense.description || "",
      amount: expense.amount ?? "",
      date: expense.date ? new Date(expense.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      paymentMethod: expense.paymentMethod || "cash",
      expenseType: expense.expenseType || "daily",
      category: resolvedCat,
      accountId: expense.account?._id || expense.account || "",
      notes: expense.notes || "",
    });
    setEditError("");
  };

  // إرسال التعديل
  const handleEditSubmit = async (event) => {
    event.preventDefault();

    if (!editForm.expenseType || !editForm.category) {
      setEditError(t("expenses.validation.typeAndCategoryRequired"));
      return;
    }

    setEditSaving(true);
    setEditError("");

    const catName = getCategoryName(editForm.category);

    const payload = {
      description: editForm.description.trim(),
      amount: Number(editForm.amount),
      date: editForm.date,
      paymentMethod: editForm.paymentMethod,
      expenseType: editForm.expenseType,
      category: catName,
      notes: editForm.notes.trim(),
      currency: "EGP",
      status: "confirmed",
      accountId: editForm.accountId || null,
    };

    const result = await dispatch(
      updateExpenseEntry({ id: editingExpense._id, payload })
    );

    if (updateExpenseEntry.fulfilled.match(result)) {
      setEditingExpense(null);
      showToast(t("expenses.toast.updated"));
      loadAccounts();
      loadCategories();
      refetchExpenses();
    } else {
      setEditError(result.payload || t("expenses.errors.updateFailed"));
    }
    setEditSaving(false);
  };

  // تأكيد الحذف
  const handleConfirmDelete = async () => {
    if (!deletingExpense) return;

    setDeleteLoading(true);
    setDeleteError("");

    const result = await dispatch(deleteExpenseEntry(deletingExpense._id));

    if (deleteExpenseEntry.fulfilled.match(result)) {
      setDeletingExpense(null);
      showToast(t("expenses.toast.deleted"));
      loadAccounts();
      refetchExpenses();
    } else {
      setDeleteError(result.payload || t("expenses.errors.deleteFailed"));
    }
    setDeleteLoading(false);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <ExpenseToast toastMessage={toastMessage} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{t("nav.expenses")}</h1>
          <p className="mt-1 text-slate-500">{t("expenses.subtitle")}</p>
        </div>

        <Link to="/dashboard" className="font-semibold text-brand-700 hover:underline">
          {t("common.backToDashboard")}
        </Link>
      </div>

      <ExpensesSummary isFiltered={isFiltered} totalExpenses={totalExpenses} />

      <ExpenseForm
        form={form}
        setForm={setForm}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        availableAccounts={availableAccounts}
        createStatus={createStatus}
        createError={createError}
      />

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100">
        <ExpenseFilters
          filters={filters}
          setFilters={setFilters}
          handleFilterChange={handleFilterChange}
          isFiltered={isFiltered}
          resetFilters={resetFilters}
          availableAccounts={availableAccounts}
          availableCategories={availableCategories}
          getCategoryName={getCategoryName}
          getCategoryColor={getCategoryColor}
        />
        <ExpensesList
          items={items}
          status={status}
          isFiltered={isFiltered}
          resetFilters={resetFilters}
          getCategoryName={getCategoryName}
          getCategoryColor={getCategoryColor}
          openEditModal={openEditModal}
          setDeletingExpense={setDeletingExpense}
          setDeleteError={setDeleteError}
        />
      </section>

      <EditExpenseModal
        editingExpense={editingExpense}
        setEditingExpense={setEditingExpense}
        editForm={editForm}
        setEditForm={setEditForm}
        handleEditChange={handleEditChange}
        handleEditSubmit={handleEditSubmit}
        editSaving={editSaving}
        editError={editError}
        availableAccounts={availableAccounts}
      />

      <DeleteExpenseModal
        deletingExpense={deletingExpense}
        setDeletingExpense={setDeletingExpense}
        deleteLoading={deleteLoading}
        deleteError={deleteError}
        handleConfirmDelete={handleConfirmDelete}
        getCategoryName={getCategoryName}
      />
    </div>
  );
}

export default ExpensesPage;
