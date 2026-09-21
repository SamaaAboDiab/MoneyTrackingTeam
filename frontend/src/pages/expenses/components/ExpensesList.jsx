import ExpenseListItem from "./ExpenseListItem";

function ExpensesList({
  items,
  status,
  isFiltered,
  getCategoryName,
  getCategoryColor,
  onResetFilters,
  onEdit,
  onDelete,
}) {
  if (status === "loading") {
    return <p className="mt-6 text-center text-sm text-slate-500">جارٍ تحميل المصروفات...</p>;
  }

  if (items.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-dashed border-slate-200 p-8 text-center">
        <p className="text-sm font-medium text-slate-600">
          {isFiltered ? "لا توجد مصروفات تطابق معايير الفلترة المحددة." : "لا توجد مصروفات مسجلة حاليًا."}
        </p>
        {isFiltered && (
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-2 text-xs font-semibold text-brand-600 hover:underline"
          >
            إعادة ضبط الفلاتر لعرض كل المصروفات
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col divide-y divide-slate-100">
      {items.map((expense) => (
        <ExpenseListItem
          key={expense._id}
          expense={expense}
          categoryName={getCategoryName(expense.category)}
          categoryColor={getCategoryColor(expense.category)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default ExpensesList;
