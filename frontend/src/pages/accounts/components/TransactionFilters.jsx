const inputClass =
  "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500";
const labelClass = "text-sm font-semibold text-slate-700";

function TransactionFilters({ start, end, onStartChange, onEndChange, onSubmit, t }) {
  return (
    <form
      className="mt-6 grid grid-cols-1 gap-4 rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100 sm:grid-cols-3 sm:items-end"
      onSubmit={onSubmit}
    >
      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>{t("accounts.transactions.startDate")}</label>
        <input
          type="date"
          value={start}
          onChange={(event) => onStartChange(event.target.value)}
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>{t("accounts.transactions.endDate")}</label>
        <input
          type="date"
          value={end}
          onChange={(event) => onEndChange(event.target.value)}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700"
      >
        {t("accounts.transactions.filter")}
      </button>
    </form>
  );
}

export default TransactionFilters;
