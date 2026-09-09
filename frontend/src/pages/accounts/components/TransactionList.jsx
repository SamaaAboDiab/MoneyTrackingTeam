import TransactionRow from "./TransactionRow";

function TransactionList({ transactions, status, error, formatDate, t }) {
  return (
    <>
      {status === "loading" && <p>{t("accounts.transactions.loading")}</p>}
      {error && <p className="auth-error">{error}</p>}
      {status === "succeeded" && transactions.length === 0 && <p>{t("accounts.transactions.empty")}</p>}
      <section className="transactions-list" aria-live="polite">
        {transactions.map((transaction) => <TransactionRow key={transaction._id} transaction={transaction} formatDate={formatDate} t={t} />)}
      </section>
    </>
  );
}

export default TransactionList;