function TransactionFilters({ start, end, onStartChange, onEndChange, onSubmit, t }) {
  return (
    <form className="transactions-filter" onSubmit={onSubmit}>
      <label>
        {t("accounts.transactions.startDate")}
        <input type="date" value={start} onChange={(event) => onStartChange(event.target.value)} />
      </label>
      <label>
        {t("accounts.transactions.endDate")}
        <input type="date" value={end} onChange={(event) => onEndChange(event.target.value)} />
      </label>
      <button type="submit">{t("accounts.transactions.filter")}</button>
    </form>
  );
}

export default TransactionFilters;