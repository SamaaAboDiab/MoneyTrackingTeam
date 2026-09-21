import CategorySelect from "../../categories/components/CategorySelect";
import { inputClass, labelClass, formatMoney } from "../constants";

function ExpenseForm({
  form,
  availableAccounts,
  createStatus,
  createError,
  onChange,
  onCategoryChange,
  onSubmit,
}) {
  return (
    <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100">
      <h2 className="text-lg font-bold text-slate-900">إضافة مصروف جديد</h2>

      <form onSubmit={onSubmit} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="description" className={labelClass}>الوصف</label>
          <input
            id="description"
            name="description"
            value={form.description}
            onChange={onChange}
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
            onChange={onChange}
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
            onChange={onChange}
            required
            className={`${inputClass} font-medium text-slate-800`}
          />
          {form.date && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 pr-1">
              <svg className="h-3.5 w-3.5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z"
                  clipRule="evenodd"
                />
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
            onChange={onChange}
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
            onChange={onChange}
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
            onChange={onCategoryChange}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="accountId" className={labelClass}>الحساب المخصوم منه (اختياري)</label>
          <select
            id="accountId"
            name="accountId"
            value={form.accountId}
            onChange={onChange}
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
            onChange={onChange}
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
  );
}

export default ExpenseForm;
