import IncomeItem from "./IncomeItem";

function IncomeList({
  items,
  status,
  error,
  displayCurrency,
  totalAmount,
  onEdit,
  onDeleted,
  t,
}) {
  const calculatedTotal = items.reduce(
    (sum, income) => sum + Number(income.convertedAmount ?? income.amount ?? 0),
    0
  );
  const total = totalAmount ?? calculatedTotal;

  return (
    <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-slate-900">{t("income.listTitle")}</h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
          {items.length}
        </span>
      </div>

      {status === "loading" && <p className="mt-4 text-slate-500">{t("income.loading")}</p>}
      {error && (
        <p className="mt-4 rounded-xl bg-expense-soft px-4 py-2.5 text-sm font-medium text-expense">
          {error}
        </p>
      )}
      {status === "succeeded" && items.length === 0 && (
        <p className="mt-4 text-slate-500">{t("income.empty")}</p>
      )}

      <div className="mt-2 flex flex-col divide-y divide-slate-100">
        {items.map((income) => (
          <IncomeItem
            key={income._id}
            income={income}
            displayAmount={income.convertedAmount ?? income.amount}
            displayCurrency={income.convertedAmount !== undefined ? displayCurrency : income.currency}
            onEdit={onEdit}
            onDeleted={onDeleted}
          />
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4">
        <span className="font-bold text-slate-700">الإجمالي بالعملة المختارة</span>
        <strong className="tabular-amount text-xl font-extrabold text-income">
          {Number(total).toLocaleString("ar-EG", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} {displayCurrency}
        </strong>
      </div>
    </section>
  );
}

export default IncomeList;
