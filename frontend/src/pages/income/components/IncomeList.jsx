import IncomeItem from "./IncomeItem";

function IncomeList({ items, status, error, t }) {
  return (
    <section className="income-panel">
      <div className="income-list-header">
        <h2>{t("income.listTitle")}</h2>
        <span>{items.length}</span>
      </div>
      {status === "loading" && <p>{t("income.loading")}</p>}
      {error && <p className="income-error">{error}</p>}
      {status === "succeeded" && items.length === 0 && <p className="income-empty">{t("income.empty")}</p>}
      <div className="income-list">
        {items.map((income) => <IncomeItem key={income._id} income={income} />)}
      </div>
    </section>
  );
}

export default IncomeList;