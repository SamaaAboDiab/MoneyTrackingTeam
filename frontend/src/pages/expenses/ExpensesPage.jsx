import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createExpenseEntry, fetchExpenses, resetExpenseCreateStatus } from "../../store/slices/expensesSlice";
import CategorySelect from "../categories/components/CategorySelect";
const EMPTY_FORM = {
  description: "",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  paymentMethod: "cash",
  expenseType: "",
  category: "",
  notes: "",
};

const TYPE_STYLES = {
  daily: { label: "يومي", color: "#ef4444", pill: "bg-red-100 text-red-700" },
  fixed: { label: "شهري ثابت", color: "#facc15", pill: "bg-yellow-100 text-yellow-700" },
  emergency: { label: "طارئ", color: "#9ca3af", pill: "bg-slate-200 text-slate-700" },
};


const inputClass =
  "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500";
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
  const { items, status, error, createStatus, createError } = useSelector((state) => state.expenses);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    dispatch(fetchExpenses());
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.expenseType || !form.category) {
      return;
    }

    const result = await dispatch(createExpenseEntry({
      description: form.description.trim(),
      amount: Number(form.amount),
      date: form.date,
      paymentMethod: form.paymentMethod,
      expenseType: form.expenseType,
      category: form.category,
      notes: form.notes.trim(),
      currency: "EGP",
      status: "confirmed",
    }));

    if (createExpenseEntry.fulfilled.match(result)) {
      setForm({ ...EMPTY_FORM, date: new Date().toISOString().slice(0, 10) });
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">المصروفات</h1>
          <p className="mt-1 text-slate-500">صنّف كل مصروفك حسب نوعه وفئته.</p>
        </div>

        <Link to="/dashboard" className="font-semibold text-brand-700 hover:underline">
          الرجوع للوحة التحكم
        </Link>
      </div>

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100">
        <p className="text-sm font-medium text-slate-500">إجمالي المصروفات</p>
        <div className="mt-1 flex items-baseline gap-2">
          <strong className="tabular-amount text-3xl font-extrabold text-slate-900">
            {formatMoney(totalExpenses)}
          </strong>
          <span className="text-sm font-medium text-slate-500">EGP</span>
        </div>
      </section>

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
              placeholder="مثال: شراء groceries"
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
              className={inputClass}
            />
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
  onChange={(value) =>
    setForm((prev) => ({ ...prev, category: value }))
  }
/>
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="notes" className={labelClass}>ملاحظات (اختياري)</label>
            <textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
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

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100">
        <h3 className="text-lg font-bold text-slate-900">قائمة المصروفات</h3>

        {status === "loading" ? (
          <p className="mt-4 text-slate-500">جارٍ تحميل المصروفات...</p>
        ) : items.length === 0 ? (
          <p className="mt-4 text-slate-500">لا توجد مصروفات مسجلة حاليًا.</p>
        ) : (
          <div className="mt-4 flex flex-col divide-y divide-slate-100">
            {items.map((expense) => {
              const typeInfo = TYPE_STYLES[expense.expenseType] || TYPE_STYLES.fixed;
              return (
                <div key={expense._id} className="grid grid-cols-1 gap-3 py-4 sm:grid-cols-5">
                  <div>
                    <span className="block text-xs font-medium text-slate-500">الوصف</span>
                    <strong className="text-slate-900">{expense.description}</strong>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-slate-500">الفئة</span>
                    <span className="text-sm text-slate-700">{expense.category}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-slate-500">النوع</span>
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${typeInfo.pill}`}>
                      {typeInfo.label}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-slate-500">المبلغ</span>
                    <span className="tabular-amount text-sm font-bold text-expense">
                      {formatMoney(expense.amount)} {expense.currency || "EGP"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-slate-500">التاريخ</span>
                    <span className="text-sm text-slate-700">
                      {new Date(expense.date).toLocaleDateString("ar-EG")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default ExpensesPage;
