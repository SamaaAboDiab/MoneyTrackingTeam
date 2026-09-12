import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  clearIncomeCreateState,
  clearIncomeUpdateError,
  createIncomeEntry,
  fetchIncomes,
  updateIncomeEntry,
} from "../../store/slices/incomeSlice";
import IncomeForm from "./components/IncomeForm";
import IncomeList from "./components/IncomeList";

const EMPTY_FORM = {
  name: "",
  category: "salary",
  amount: "",
  currency: "EGP",
  receivedDate: "",
  recurrence: "once",
  status: "cleared",
  notes: "",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500";
const labelClass = "text-sm font-semibold text-slate-700";
const errorClass = "rounded-xl bg-expense-soft px-4 py-2.5 text-sm font-medium text-expense";

function formatMoney(value) {
  const num = Number(value || 0);
  return new Intl.NumberFormat("ar-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

function IncomePage() {
  const dispatch = useDispatch();
  const { items, status, error, createStatus, createError, updateStatus, updateError } = useSelector((state) => state.incomes);

  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [successMessage, setSuccessMessage] = useState("");
  const [createForm, setCreateForm] = useState({
    name: "",
    category: "",
    amount: "",
    currency: "EGP",
    receivedDate: "",
    notes: "",
  });

  useEffect(() => {
    dispatch(fetchIncomes());
  }, [dispatch]);

  useEffect(() => {
    if (!updateError) return;
    const timer = setTimeout(() => dispatch(clearIncomeUpdateError()), 3000);
    return () => clearTimeout(timer);
  }, [updateError, dispatch]);

  useEffect(() => {
    if (createStatus !== "succeeded") return;
    const timer = setTimeout(() => dispatch(clearIncomeCreateState()), 3000);
    return () => clearTimeout(timer);
  }, [createStatus, dispatch]);

  const totalIncome = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [items]
  );

  const openEditModal = (income) => {
    setSelectedId(income._id);
    setForm({
      name: income.name || "",
      category: income.category || "salary",
      amount: income.amount ?? "",
      currency: income.currency || "EGP",
      receivedDate: income.receivedDate ? new Date(income.receivedDate).toISOString().slice(0, 10) : "",
      recurrence: income.recurrence || "once",
      status: income.status || "cleared",
      notes: income.notes || "",
    });
    setIsEditing(true);
    setSuccessMessage("");
  };

  const closeEditModal = () => {
    setIsEditing(false);
    setSelectedId(null);
    setForm(EMPTY_FORM);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateChange = (event) => {
    const { name, value } = event.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();
    const result = await dispatch(createIncomeEntry({
      ...createForm,
      name: createForm.name.trim(),
      amount: Number(createForm.amount),
      notes: createForm.notes.trim(),
    }));

    if (createIncomeEntry.fulfilled.match(result)) {
      setCreateForm({ name: "", category: "", amount: "", currency: "EGP", receivedDate: "", notes: "" });
    }
  };

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
      notes: form.notes.trim(),
    };

    const result = await dispatch(
      updateIncomeEntry({ id: selectedId, payload })
    );

    if (updateIncomeEntry.fulfilled.match(result)) {
      setSuccessMessage("تم التعديل بنجاح");
      closeEditModal();
      dispatch(fetchIncomes());
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">مصادر الدخل</h1>
          <p className="mt-1 text-slate-500">إدارة مصادر الدخل وتحديثها بسهولة</p>
        </div>

        <Link to="/dashboard" className="font-semibold text-brand-700 hover:underline">
          العودة للوحة التحكم
        </Link>
      </div>

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100">
        <p className="text-sm font-medium text-slate-500">إجمالي الدخل</p>
        <div className="mt-1 flex items-baseline gap-2">
          <strong className="tabular-amount text-3xl font-extrabold text-slate-900">
            {formatMoney(totalIncome)}
          </strong>
          <span className="text-sm font-medium text-slate-500">EGP</span>
        </div>
      </section>

      {error && <p className={`mt-4 ${errorClass}`}>{error}</p>}
      {updateError && <p className={`mt-4 ${errorClass}`}>{updateError}</p>}
      {successMessage && (
        <p className="mt-4 rounded-xl bg-income-soft px-4 py-2.5 text-sm font-medium text-income">
          {successMessage}
        </p>
      )}

      <IncomeForm
        form={createForm}
        createStatus={createStatus}
        createError={createError}
        onChange={handleCreateChange}
        onSubmit={handleCreateSubmit}
        t={(key) => ({
          "income.formTitle": "إضافة مصدر دخل",
          "income.nameLabel": "اسم مصدر الدخل",
          "income.namePlaceholder": "مثال: راتب شهر سبتمبر",
          "income.categoryLabel": "نوع الدخل",
          "income.categoryPlaceholder": "اختار نوع الدخل",
          "income.amountLabel": "المبلغ",
          "income.currencyLabel": "العملة",
          "income.receivedDateLabel": "تاريخ الاستلام",
          "income.notesLabel": "ملاحظات (اختياري)",
          "income.notesPlaceholder": "أضف أي تفاصيل تساعدك لاحقاً",
          "income.submit": "إضافة مصدر الدخل",
          "income.submitting": "جارٍ الحفظ...",
          "income.success": "تم إضافة مصدر الدخل بنجاح",
        }[key] || key)}
      />

      <IncomeList items={items} status={status} error={error} onEdit={openEditModal} t={(key) => ({
        "income.listTitle": "مصادر الدخل المضافة",
        "income.loading": "جارٍ تحميل مصادر الدخل...",
        "income.empty": "لسه مفيش مصادر دخل مضافة.",
      }[key] || key)} />

      {isEditing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-500/20 p-4 backdrop-blur-[2px]"
          onClick={closeEditModal}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-slate-900">تعديل مصدر الدخل</h2>

            <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="name" className={labelClass}>
                  اسم المصدر
                </label>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  required
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="category" className={labelClass}>
                  الفئة
                </label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleFormChange}
                  className={inputClass}
                >
                  <option value="salary">راتب</option>
                  <option value="freelance">عمل حر</option>
                  <option value="rental">إيجار</option>
                  <option value="investment">استثمار</option>
                  <option value="other">أخرى</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="amount" className={labelClass}>
                  المبلغ
                </label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={handleFormChange}
                  required
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="currency" className={labelClass}>
                  العملة
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={form.currency}
                  onChange={handleFormChange}
                  className={inputClass}
                >
                  <option value="EGP">EGP</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="receivedDate" className={labelClass}>
                  تاريخ الاستلام
                </label>
                <input
                  id="receivedDate"
                  name="receivedDate"
                  type="date"
                  value={form.receivedDate}
                  onChange={handleFormChange}
                  required
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="recurrence" className={labelClass}>
                  التكرار
                </label>
                <select
                  id="recurrence"
                  name="recurrence"
                  value={form.recurrence}
                  onChange={handleFormChange}
                  className={inputClass}
                >
                  <option value="once">مرة واحدة</option>
                  <option value="weekly">أسبوعي</option>
                  <option value="monthly">شهري</option>
                  <option value="yearly">سنوي</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="status" className={labelClass}>
                  الحالة
                </label>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                  className={inputClass}
                >
                  <option value="cleared">مستلمة</option>
                  <option value="pending">قيد الانتظار</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="notes" className={labelClass}>
                  ملاحظات
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows="3"
                  value={form.notes}
                  onChange={handleFormChange}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="flex gap-3 sm:col-span-2">
                <button
                  type="submit"
                  disabled={updateStatus === "loading"}
                  className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-65"
                >
                  {updateStatus === "loading" ? "جارٍ الحفظ..." : "حفظ التعديلات"}
                </button>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default IncomePage;
