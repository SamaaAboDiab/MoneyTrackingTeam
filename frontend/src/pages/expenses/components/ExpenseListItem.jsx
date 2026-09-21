import { TYPE_STYLES, formatMoney } from "../constants";

function ExpenseListItem({ expense, categoryName, categoryColor, onEdit, onDelete }) {
  const typeInfo = TYPE_STYLES[expense.expenseType] || TYPE_STYLES.fixed;

  return (
    <div className="grid grid-cols-1 items-center gap-3 py-4 md:grid-cols-12 hover:bg-slate-50/50 rounded-xl px-2 transition">
      <div className="md:col-span-3">
        <span className="block text-xs font-medium text-slate-400">الوصف</span>
        <strong className="text-sm text-slate-900">{expense.description}</strong>
        {expense.notes && <p className="text-xs text-slate-500 truncate">{expense.notes}</p>}
      </div>

      {/* اسم الفئة مع نقطة ملونة بلون التصنيف */}
      <div className="md:col-span-2">
        <span className="block text-xs font-medium text-slate-400">الفئة</span>
        <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <span
            className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
            style={{ backgroundColor: categoryColor }}
          />
          {categoryName}
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
              <path
                fillRule="evenodd"
                d="M10 1l7 4v1H3V5l7-4zm-5 7h2v6H5V8zm4 0h2v6H9V8zm4 0h2v6h-2V8zM2 16h16v2H2v-2z"
                clipRule="evenodd"
              />
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
          onClick={() => onEdit(expense)}
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
          onClick={() => onDelete(expense)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
          title="حذف هذا المصروف"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M8.75 1A1.75 1.75 0 0 0 7 2.75V3H4a.75.75 0 0 0 0 1.5h.5v10.75A2.75 2.75 0 0 0 7.25 18h5.5a2.75 2.75 0 0 0 2.75-2.75V4.5h.5a.75.75 0 0 0 0-1.5h-3v-.25A1.75 1.75 0 0 0 11.25 1h-2.5ZM8.5 2.75a.25.25 0 0 1 .25-.25h2.5a.25.25 0 0 1 .25.25V3h-3v-.25ZM6 4.5h8v10.75c0 .69-.56 1.25-1.25 1.25h-5.5c-.69 0-1.25-.56-1.25-1.25V4.5Z"
              clipRule="evenodd"
            />
          </svg>
          <span>حذف</span>
        </button>
      </div>
    </div>
  );
}

export default ExpenseListItem;
