import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getAccountTransactions } from "../../api/accountsApi";
import { extractError } from "../../utils/errorHandler";
import "../../app/App.css";

function AccountHistoryPage() {
  const { t } = useTranslation();
  const { accountId } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [accountName, setAccountName] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  const loadTransactions = async (filters = { start, end }) => {
    setStatus("loading");
    setError(null);
    try {
      const response = await getAccountTransactions(accountId, {
        start: filters.start || undefined,
        end: filters.end ? `${filters.end}T23:59:59.999` : undefined,
      });
      const data = response.data.data || [];
      setTransactions([...data].sort((a, b) => new Date(b.date) - new Date(a.date)));
      if (data[0]?.account?.name) setAccountName(data[0].account.name);
      setStatus("succeeded");
    } catch (requestError) {
      setError(extractError(requestError, t("accounts.transactions.error")));
      setStatus("failed");
    }
  };

  useEffect(() => {
    loadTransactions({ start: "", end: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  const formatDate = (value) => new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

  return (
    <main className="transactions-page">
      <p><Link to="/accounts">{t("accounts.transactions.back")}</Link></p>
      <h1>{t("accounts.historyTitle", { name: accountName || "..." })}</h1>

      <form
        className="transactions-filter"
        onSubmit={(event) => {
          event.preventDefault();
          loadTransactions();
        }}
      >
        <label>
          {t("accounts.transactions.startDate")}
          <input type="date" value={start} onChange={(event) => setStart(event.target.value)} />
        </label>
        <label>
          {t("accounts.transactions.endDate")}
          <input type="date" value={end} onChange={(event) => setEnd(event.target.value)} />
        </label>
        <button type="submit">{t("accounts.transactions.filter")}</button>
      </form>

      {status === "loading" && <p>{t("accounts.transactions.loading")}</p>}
      {error && <p className="auth-error">{error}</p>}
      {status === "succeeded" && transactions.length === 0 && (
        <p>{t("accounts.transactions.empty")}</p>
      )}

      <section className="transactions-list" aria-live="polite">
        {transactions.map((transaction) => (
          <article className="transaction-row" key={transaction._id}>
            <div>
              <span className="transaction-label">{t("accounts.transactions.date")}</span>
              {formatDate(transaction.date)}
            </div>
            <div>
              <span className="transaction-label">{t("accounts.transactions.description")}</span>
              {transaction.description}
            </div>
            <div className={transaction.type === "credit" ? "transaction-amount-credit" : transaction.type === "debit" ? "transaction-amount-debit" : ""}>
              <span className="transaction-label">{t("accounts.transactions.amount")}</span>
              {transaction.type === "credit" ? "+" : transaction.type === "debit" ? "-" : ""}
              {Number(transaction.amount).toLocaleString()} {transaction.account?.currency || ""}
            </div>
            <div>
              <span className="transaction-label">{t("accounts.transactions.balanceAfter")}</span>
              {Number(transaction.balanceAfter).toLocaleString()} {transaction.account?.currency || ""}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

export default AccountHistoryPage;
