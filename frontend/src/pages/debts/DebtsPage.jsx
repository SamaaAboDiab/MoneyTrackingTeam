import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import {
  createDebtEntry,
  fetchDebts,
  clearDebtCreateState,
} from "../../store/slices/debtsSlice";

const EMPTY_FORM = {
  creditor: "",
  totalAmount: "",
  currency: "EGP",
  startDate: "",
  dueDate: "",
  description: "",
};

function formatMoney(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("ar-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function DebtsPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { items, status, error, createStatus, createError } = useSelector((state) => state.debts);

  const [form, setForm] = useState(EMPTY_FORM);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    dispatch(fetchDebts());
  }, [dispatch]);

  useEffect(() => {
    if (createStatus !== "succeeded") return;

    const timer = setTimeout(() => {
      dispatch(clearDebtCreateState());
    }, 3000);

    return () => clearTimeout(timer);
  }, [createStatus, dispatch]);

  const totalDebt = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0),
    [items]
  );

  const handleChange = ({ target }) => {
    const { name, value } = target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      creditor: form.creditor.trim(),
      totalAmount: Number(form.totalAmount),
      currency: form.currency,
      startDate: form.startDate,
      dueDate: form.dueDate,
      description: form.description.trim(),
    };

    const result = await dispatch(createDebtEntry(payload));

    if (createDebtEntry.fulfilled.match(result)) {
      setForm(EMPTY_FORM);
      setSuccessMessage("تم إضافة الدين بنجاح");
      dispatch(fetchDebts());
    } else {
      setSuccessMessage("");
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{t("nav.debts")}</h1>
          <p className="mt-1 text-sm text-slate-500">سجّل كل ديونك وراجعها بسهولة</p>
        </div>
        <Link to="/dashboard" className="font-semibold text-brand-700 hover:underline">
          {t("common.backToDashboard")}
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-5 text-lg font-bold text-slate-900">إضافة دين جديد</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">اسم الدائن</span>
              <input
                type="text"
                name="creditor"
                value={form.creditor}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 outline-none transition focus:border-brand-500"
                placeholder="مثال: بنك الأهلي"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">المبلغ الكلي</span>
              <input
                type="number"
                min="0"
                step="0.01"
                name="totalAmount"
                value={form.totalAmount}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 outline-none transition focus:border-brand-500"
                placeholder="0.00"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">العملة</span>
              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 outline-none transition focus:border-brand-500"
                required
              >
                <option value="EGP">EGP</option>
                <option value="USD">USD</option>
                <option value="SAR">SAR</option>
                <option value="AED">AED</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">تاريخ نشأة الدين</span>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 outline-none transition focus:border-brand-500"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">تاريخ السداد المتوقع</span>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 outline-none transition focus:border-brand-500"
                required
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">ملاحظات</span>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="3"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 outline-none transition focus:border-brand-500"
                placeholder="أضف أي تفاصيل أو ملاحظات عن الدين"
              />
            </label>
          </div>

          {createError && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
              {createError}
            </div>
          )}

          {successMessage && (
            <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={createStatus === "loading"}
            className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {createStatus === "loading" ? "جارٍ الحفظ..." : "إضافة الدين"}
          </button>
        </form>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h3 className="text-lg font-bold text-slate-900">ملخص الديون</h3>
          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
            <div className="text-sm text-slate-500">إجمالي قيمة الديون</div>
            <div className="mt-2 text-3xl font-extrabold text-slate-900">
              {formatMoney(totalDebt)}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {status === "loading" && <p className="text-sm text-slate-500">جارٍ تحميل الديون...</p>}
            {status === "failed" && <p className="text-sm text-red-600">{error}</p>}
            {items.length === 0 && status !== "loading" && (
              <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                ما فيش ديون مضافة بعد.
              </p>
            )}

            {items.map((debt) => (
              <div key={debt._id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-900">{debt.creditor}</h4>
                    <p className="text-xs text-slate-500">{debt.category || "other"}</p>
                  </div>
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                    {debt.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                  <span>المبلغ</span>
                  <strong className="text-slate-900">{formatMoney(debt.totalAmount)} {debt.currency}</strong>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                  <span>تاريخ الاستحقاق</span>
                  <span>{new Date(debt.dueDate).toLocaleDateString("ar-EG")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DebtsPage;
