import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  createExpenseEntry,
  fetchExpenses,
  resetExpenseCreateStatus,
  updateExpenseEntry,
  deleteExpenseEntry,
} from "../../store/slices/expensesSlice";
import CategorySelect from "../categories/components/CategorySelect";
import { getAccounts } from "../../api/accountsApi";
import { listCategories } from "../../api/categoryApi";

const EMPTY_FORM = {
  description: "",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  paymentMethod: "cash",
  expenseType: "",
  category: "",
  accountId: "",
  notes: "",
};

const EMPTY_FILTERS = {
  period: "all",
  startDate: "",
  endDate: "",
  type: "all",
  category: "all",
  account: "all",
};

const TYPE_STYLES = {
  daily:     { label: "يومي",       pill: "bg-red-100 text-red-700" },
  fixed:     { label: "شهري ثابت",  pill: "bg-yellow-100 text-yellow-700" },
  emergency: { label: "طارئ",       pill: "bg-slate-200 text-slate-700" },
};

// Fallback color map for default categories (used when API hasn't loaded yet)
const FALLBACK_CATEGORY_COLORS = {
  "أكل": "#f97316",
  "مواصلات": "#3b82f6",
  "إيجار": "#f59e0b",
  "فواتير": "#8b5cf6",
  "صحة": "#10b981",
  "تعليم": "#0ea5e9",
  "تسلية": "#ec4899",
  "غيره": "#6b7280",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500 bg-white";
const labelClass = "text-sm font-semibold text-slate-700";

function formatMoney(value) {
  const num = Number(value || 0);
  return new Intl.NumberFormat("ar-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

function ExpensesPage() {
  const dispatch = useDispatch();
  const { items, status, createStatus, createError } = useSelector((state) => state.expenses);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [filterCatOpen, setFilterCatOpen] = useState(false);
  const filterCatRef = useRef(null);

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
        setAvailableAccounts(Array.isArray(accs) ? accs : []);
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

  // إغلاق قائمة فلتر التصنيف عند الضغط خارجها
  useEffect(() => {
    function handleClickOutside(e) {
      if (filterCatRef.current && !filterCatRef.current.contains(e.target)) {
        setFilterCatOpen(false);
      }
    }
    if (filterCatOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [filterCatOpen]);

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
      showToast("تمت إضافة المصروف وخصمه من الحساب بنجاح");
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
      setEditError("يرجى اختيار نوع المصروف والتصنيف.");
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
      showToast("تم تحديث المصروف وتحديث رصيد الحساب بنجاح");
      loadAccounts();
      loadCategories();
      refetchExpenses();
    } else {
      setEditError(result.payload || "تعذر تعديل المصروف.");
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
      showToast("تم حذف المصروف واسترجاع الرصيد للحساب بنجاح");
      loadAccounts();
      refetchExpenses();
    } else {
      setDeleteError(result.payload || "تعذر حذف المصروف.");
    }
    setDeleteLoading(false);
  };

  return (
    <div className="mx-auto max-w-5xl" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 left-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-2xl transition">
          <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">المصروفات</h1>
          <p className="mt-1 text-slate-500">إدارة وتعديل وحذف كل مصروف، ومتابعة التأثير على الحسابات.</p>
        </div>

        <Link to="/dashboard" className="font-semibold text-brand-700 hover:underline">
          الرجوع للوحة التحكم
        </Link>
      </div>

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100">
        <p className="text-sm font-medium text-slate-500">إجمالي المصروفات {isFiltered && "(المفلترة)"}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <strong className="tabular-amount text-3xl font-extrabold text-slate-900">
            {formatMoney(totalExpenses)}
          </strong>
          <span className="text-sm font-medium text-slate-500">EGP</span>
        </div>
      </section>

      {/* نموذج إضافة مصروف جديد */}
      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100">
        <h2 className="text-lg font-bold text-slate-900">إضافة مصروف جديد</h2>

        <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="description" className={labelClass}>الوصف</label>
            <input
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="مثال: مشتريات السوبرماركت، فاتورة إنترنت، صيانة السيارة..."
              required
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="amount" className={labelClass}>المبلغ</label>
            <input
              id="amount"
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              required
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="date" className={labelClass}>التاريخ</label>
            <input
              id="date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
              className={`${inputClass} font-medium text-slate-800`}
            />
            {form.date && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 pr-1">
                <svg className="h-3.5 w-3.5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
                </svg>
                {new Date(form.date).toLocaleDateString("ar-EG", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="paymentMethod" className={labelClass}>طريقة الدفع</label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="cash">كاش</option>
              <option value="card">بطاقة</option>
              <option value="wallet">محفظة</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="expenseType" className={labelClass}>نوع المصروف</label>
            <select
              id="expenseType"
              name="expenseType"
              value={form.expenseType}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="">اختر النوع</option>
              <option value="daily">يومي</option>
              <option value="fixed">شهري ثابت</option>
              <option value="emergency">طارئ</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="category" className={labelClass}>التصنيف</label>
            <CategorySelect
              value={form.category}
              expenseType={form.expenseType}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, category: value }))
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="accountId" className={labelClass}>الحساب المخصوم منه (اختياري)</label>
            <select
              id="accountId"
              name="accountId"
              value={form.accountId}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">بدون حساب محدد</option>
              {availableAccounts.map((acc) => (
                <option key={acc._id} value={acc._id}>
                  {acc.name} ({formatMoney(acc.balance)} {acc.currency || "EGP"})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="notes" className={labelClass}>ملاحظات (اختياري)</label>
            <textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="أضف أي تفاصيل أو ملاحظات إضافية هنا (اختياري)..."
              rows="3"
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="flex flex-col justify-end gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
            {createError && (
              <p className="rounded-xl bg-expense-soft px-4 py-2.5 text-sm font-medium text-expense">
                {createError}
              </p>
            )}
            {createStatus === "succeeded" && (
              <p className="rounded-xl bg-income-soft px-4 py-2.5 text-sm font-medium text-income">
                تم إضافة المصروف بنجاح
              </p>
            )}
            <button
              type="submit"
              disabled={createStatus === "loading"}
              className="ms-auto rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-65"
            >
              {createStatus === "loading" ? "جارٍ الحفظ..." : "إضافة المصروف"}
            </button>
          </div>
        </form>
      </section>

      {/* قسم قائمة المصروفات مع الفلاتر وأزرار التعديل والحذف */}
      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">قائمة المصروفات</h3>
            <p className="text-xs text-slate-500">فلترة المصروفات، وتعديلها أو حذفها مع تحديث الأرصدة تلقائياً.</p>
          </div>

          {isFiltered && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
            >
              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
              <span>مسح الفلاتر</span>
            </button>
          )}
        </div>

        {/* شريط الفلاتر (US-204) */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* فلتر الفترة الزمنية */}
          <div className="flex flex-col gap-1">
            <label htmlFor="filter-period" className="text-xs font-semibold text-slate-600">الفترة الزمنية</label>
            <select
              id="filter-period"
              name="period"
              value={filters.period}
              onChange={handleFilterChange}
              className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-700 outline-none transition focus:border-brand-500"
            >
              <option value="all">كل الفترات</option>
              <option value="day">اليوم</option>
              <option value="week">آخر 7 أيام</option>
              <option value="month">هذا الشهر</option>
              <option value="custom">مخصص (تحديد تاريخين)</option>
            </select>
          </div>

          {/* فلتر النوع */}
          <div className="flex flex-col gap-1">
            <label htmlFor="filter-type" className="text-xs font-semibold text-slate-600">نوع المصروف</label>
            <select
              id="filter-type"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-700 outline-none transition focus:border-brand-500"
            >
              <option value="all">كل الأنواع</option>
              <option value="daily">يومي</option>
              <option value="fixed">شهري ثابت</option>
              <option value="emergency">طارئ</option>
            </select>
          </div>

          {/* فلتر التصنيف مع نقاط ملونة */}
          <div className="flex flex-col gap-1 relative" ref={filterCatRef}>
            <label htmlFor="filter-category" className="text-xs font-semibold text-slate-600">التصنيف</label>
            <button
              type="button"
              onClick={() => setFilterCatOpen((prev) => !prev)}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-700 outline-none transition focus:border-brand-500 text-right"
            >
              <span className="flex items-center gap-1.5">
                {filters.category !== "all" && (
                  <span
                    className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getCategoryColor(filters.category) }}
                  />
                )}
                <span>
                  {filters.category === "all"
                    ? "كل التصنيفات"
                    : getCategoryName(filters.category)}
                </span>
              </span>
              <svg
                className={`h-3.5 w-3.5 text-slate-400 transition-transform ${filterCatOpen ? "rotate-180" : ""}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            {filterCatOpen && (
              <div className="absolute top-full z-40 mt-1 w-full rounded-xl border border-slate-200 bg-white p-1 shadow-lg max-h-56 overflow-y-auto">
                <div
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, category: "all" }));
                    setFilterCatOpen(false);
                  }}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs transition hover:bg-slate-100 ${
                    filters.category === "all" ? "bg-brand-50 font-bold text-brand-700" : "text-slate-700"
                  }`}
                >
                  كل التصنيفات
                </div>
                {availableCategories.map((cat) => (
                  <div
                    key={cat._id || cat.name}
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, category: cat.name }));
                      setFilterCatOpen(false);
                    }}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs transition hover:bg-slate-100 ${
                      filters.category === cat.name ? "bg-brand-50 font-bold text-brand-700" : "text-slate-700"
                    }`}
                  >
                    <span
                      className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: cat.color || getCategoryColor(cat.name) }}
                    />
                    <span>{cat.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* فلتر الحساب */}
          <div className="flex flex-col gap-1">
            <label htmlFor="filter-account" className="text-xs font-semibold text-slate-600">الحساب</label>
            <select
              id="filter-account"
              name="account"
              value={filters.account}
              onChange={handleFilterChange}
              className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-700 outline-none transition focus:border-brand-500"
            >
              <option value="all">كل الحسابات</option>
              {availableAccounts.map((acc) => (
                <option key={acc._id} value={acc._id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* حقول التاريخ المخصص */}
        {filters.period === "custom" && (
          <div className="mt-3 grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="filter-startDate" className="text-xs font-semibold text-slate-600">من تاريخ</label>
              <input
                id="filter-startDate"
                name="startDate"
                type="date"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-brand-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="filter-endDate" className="text-xs font-semibold text-slate-600">إلى تاريخ</label>
              <input
                id="filter-endDate"
                name="endDate"
                type="date"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-brand-500"
              />
            </div>
          </div>
        )}

        {/* عرض المصروفات */}
        {status === "loading" ? (
          <p className="mt-6 text-center text-sm text-slate-500">جارٍ تحميل المصروفات...</p>
        ) : items.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-200 p-8 text-center">
            <p className="text-sm font-medium text-slate-600">
              {isFiltered ? "لا توجد مصروفات تطابق معايير الفلترة المحددة." : "لا توجد مصروفات مسجلة حاليًا."}
            </p>
            {isFiltered && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-2 text-xs font-semibold text-brand-600 hover:underline"
              >
                إعادة ضبط الفلاتر لعرض كل المصروفات
              </button>
            )}
          </div>
        ) : (
          <div className="mt-4 flex flex-col divide-y divide-slate-100">
            {items.map((expense) => {
              const typeInfo = TYPE_STYLES[expense.expenseType] || TYPE_STYLES.fixed;
              const displayCategoryName = getCategoryName(expense.category);
              const displayCategoryColor = getCategoryColor(expense.category);

              return (
                <div
                  key={expense._id}
                  className="grid grid-cols-1 items-center gap-3 py-4 md:grid-cols-12 hover:bg-slate-50/50 rounded-xl px-2 transition"
                >
                  <div className="md:col-span-3">
                    <span className="block text-xs font-medium text-slate-400">الوصف</span>
                    <strong className="text-sm text-slate-900">{expense.description}</strong>
                    {expense.notes && (
                      <p className="text-xs text-slate-500 truncate">{expense.notes}</p>
                    )}
                  </div>

                  {/* اسم الفئة مع نقطة ملونة بلون التصنيف */}
                  <div className="md:col-span-2">
                    <span className="block text-xs font-medium text-slate-400">الفئة</span>
                    <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                      <span
                        className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: displayCategoryColor }}
                      />
                      {displayCategoryName}
                    </span>
                  </div>

                  <div className="md:col-span-2">
                    <span className="block text-xs font-medium text-slate-400">النوع والحساب</span>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${typeInfo.pill}`}>
                      {typeInfo.label}
                    </span>
                    {expense.account && (
                      <span className="mt-1 flex items-center gap-1 text-[11px] font-medium text-slate-600 truncate">
                        <svg className="h-3 w-3 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 1l7 4v1H3V5l7-4zm-5 7h2v6H5V8zm4 0h2v6H9V8zm4 0h2v6h-2V8zM2 16h16v2H2v-2z" clipRule="evenodd" />
                        </svg>
                        <span>{expense.account.name || "حساب"}</span>
                      </span>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <span className="block text-xs font-medium text-slate-400">المبلغ</span>
                    <span className="tabular-amount text-sm font-bold text-expense">
                      {formatMoney(expense.amount)} {expense.currency || "EGP"}
                    </span>
                  </div>

                  <div className="md:col-span-1">
                    <span className="block text-xs font-medium text-slate-400">التاريخ</span>
                    <span className="text-xs text-slate-600">
                      {new Date(expense.date).toLocaleDateString("ar-EG")}
                    </span>
                  </div>

                  {/* أزرار Edit و Delete بأيقونات SVG */}
                  <div className="flex items-center justify-end gap-1.5 md:col-span-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(expense)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition"
                      title="تعديل هذا المصروف"
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                      </svg>
                      <span>تعديل</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeletingExpense(expense);
                        setDeleteError("");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                      title="حذف هذا المصروف"
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.75 1A1.75 1.75 0 0 0 7 2.75V3H4a.75.75 0 0 0 0 1.5h.5v10.75A2.75 2.75 0 0 0 7.25 18h5.5a2.75 2.75 0 0 0 2.75-2.75V4.5h.5a.75.75 0 0 0 0-1.5h-3v-.25A1.75 1.75 0 0 0 11.25 1h-2.5ZM8.5 2.75a.25.25 0 0 1 .25-.25h2.5a.25.25 0 0 1 .25.25V3h-3v-.25ZM6 4.5h8v10.75c0 .69-.56 1.25-1.25 1.25h-5.5c-.69 0-1.25-.56-1.25-1.25V4.5Z" clipRule="evenodd" />
                      </svg>
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* نافذة التعديل المنبثقة (Edit Modal) بالبيانات القديمة */}
      {editingExpense && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() => !editSaving && setEditingExpense(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">تعديل المصروف</h3>
              <button
                type="button"
                disabled={editSaving}
                onClick={() => setEditingExpense(null)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3.5">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>الوصف</label>
                <input
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  required
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>المبلغ</label>
                  <input
                    name="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={editForm.amount}
                    onChange={handleEditChange}
                    required
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>التاريخ</label>
                  <input
                    name="date"
                    type="date"
                    value={editForm.date}
                    onChange={handleEditChange}
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>طريقة الدفع</label>
                  <select
                    name="paymentMethod"
                    value={editForm.paymentMethod}
                    onChange={handleEditChange}
                    required
                    className={inputClass}
                  >
                    <option value="cash">كاش</option>
                    <option value="card">بطاقة</option>
                    <option value="wallet">محفظة</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>نوع المصروف</label>
                  <select
                    name="expenseType"
                    value={editForm.expenseType}
                    onChange={handleEditChange}
                    required
                    className={inputClass}
                  >
                    <option value="daily">يومي</option>
                    <option value="fixed">شهري ثابت</option>
                    <option value="emergency">طارئ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>التصنيف</label>
                  <CategorySelect
                    value={editForm.category}
                    expenseType={editForm.expenseType}
                    onChange={(value) =>
                      setEditForm((prev) => ({ ...prev, category: value }))
                    }
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>الحساب المخصوم منه</label>
                  <select
                    name="accountId"
                    value={editForm.accountId}
                    onChange={handleEditChange}
                    className={inputClass}
                  >
                    <option value="">بدون حساب محدد</option>
                    {availableAccounts.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.name} ({formatMoney(acc.balance)} {acc.currency || "EGP"})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>ملاحظات (اختياري)</label>
                <textarea
                  name="notes"
                  value={editForm.notes}
                  onChange={handleEditChange}
                  rows="2"
                  className={`${inputClass} resize-none`}
                />
              </div>

              {editError && (
                <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
                  {editError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={editSaving}
                  onClick={() => setEditingExpense(null)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="rounded-xl bg-brand-600 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
                >
                  {editSaving ? "جارٍ الحفظ..." : "حفظ التعديلات"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة تأكيد الحذف (Delete Confirmation Modal) */}
      {deletingExpense && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() => !deleteLoading && setDeletingExpense(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                </svg>
              </span>
              <h3 className="text-lg font-bold text-slate-900">تأكيد حذف المصروف</h3>
            </div>

            <p className="mt-3 text-sm text-slate-600">
              هل أنت متأكد من حذف مصروف <strong className="text-slate-900">"{deletingExpense.description}"</strong> بمبلغ{" "}
              <strong className="text-rose-600">{formatMoney(deletingExpense.amount)} EGP</strong> التابع لفئة{" "}
              <strong className="text-slate-800">"{getCategoryName(deletingExpense.category)}"</strong>؟
            </p>

            {deletingExpense.account && (
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-xs text-emerald-800">
                <svg className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a6 6 0 0 0-6 6c0 1.887.87 3.57 2.235 4.675A2 2 0 0 1 7 14.25v.75a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-.75a2 2 0 0 1 .765-1.575A6.002 6.002 0 0 0 16 8a6 6 0 0 0-6-6Zm-2 16a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-.5H8V18Z" />
                </svg>
                <span>
                  <strong>استرجاع الرصيد تلقائياً:</strong> سيتم إضافة مبلغ{" "}
                  <strong>{formatMoney(deletingExpense.amount)} EGP</strong> تلقائياً إلى حساب{" "}
                  <strong>"{deletingExpense.account.name || "المرتبط"}"</strong>.
                </span>
              </div>
            )}

            {deleteError && (
              <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
                {deleteError}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setDeletingExpense(null)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleConfirmDelete}
                className="rounded-xl bg-rose-600 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-rose-700 disabled:opacity-60"
              >
                {deleteLoading ? "جارٍ الحذف..." : "تأكيد الحذف"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExpensesPage;
