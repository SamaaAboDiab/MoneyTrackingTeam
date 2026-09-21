import CategorySelect from "../../categories/components/CategorySelect";
import { inputClass, labelClass, formatMoney } from "../constants";

function EditExpenseModal({
  form,
  availableAccounts,
  saving,
  error,
  onChange,
  onCategoryChange,
  onSubmit,
  onClose,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={() => !saving && onClose()}
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
            disabled={saving}
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-4 space-y-3.5">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>الوصف</label>
            <input
              name="description"
              value={form.description}
              onChange={onChange}
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
                value={form.amount}
                onChange={onChange}
                required
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>التاريخ</label>
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={onChange}
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
              <label className={labelClass}>نوع المصروف</label>
              <select
                name="expenseType"
                value={form.expenseType}
                onChange={onChange}
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
                value={form.category}
                expenseType={form.expenseType}
                onChange={onCategoryChange}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>الحساب المخصوم منه</label>
              <select
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
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>ملاحظات (اختياري)</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={onChange}
              rows="2"
              className={`${inputClass} resize-none`}
            />
          </div>

          {error && (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-brand-600 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
            >
              {saving ? "جارٍ الحفظ..." : "حفظ التعديلات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditExpenseModal;
