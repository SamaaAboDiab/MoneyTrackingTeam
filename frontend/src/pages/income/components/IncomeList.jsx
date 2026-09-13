import IncomeItem from "./IncomeItem";

function IncomeList({ items, status, error, onEdit, onDeleted, t }) {
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
            onEdit={onEdit}
            onDeleted={onDeleted}
          />
        ))}
      </div>
    </section>
  );
}

export default IncomeList;
