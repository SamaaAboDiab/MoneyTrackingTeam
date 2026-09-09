function TransactionRow({ transaction, formatDate, t }) {
  const amountClass = transaction.type === "credit"
    ? "transaction-amount-credit"
    : transaction.type === "debit" ? "transaction-amount-debit" : "";
  const sign = transaction.type === "credit" ? "+" : transaction.type === "debit" ? "-" : "";
  const currency = transaction.account?.currency || "";

  return (
    <article className="transaction-row">
      <div><span className="transaction-label">{t("accounts.transactions.date")}</span>{formatDate(transaction.date)}</div>
      <div><span className="transaction-label">{t("accounts.transactions.description")}</span>{transaction.description}</div>
      <div className={amountClass}><span className="transaction-label">{t("accounts.transactions.amount")}</span>{sign}{Number(transaction.amount).toLocaleString()} {currency}</div>
      <div><span className="transaction-label">{t("accounts.transactions.balanceAfter")}</span>{Number(transaction.balanceAfter).toLocaleString()} {currency}</div>
    </article>
  );
}

export default TransactionRow;