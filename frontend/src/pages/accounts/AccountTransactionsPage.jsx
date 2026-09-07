import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getAccountTransactions, getAccounts } from "../../api/accountsApi";
import { extractError } from "../../utils/errorHandler";
import "./AccountTransactionsPage.css";

function AccountTransactionsPage() {
  const { t, i18n } = useTranslation();
  const { accountId } = useParams();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({ start: "", end: "" });
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const loadAccount = async () => {
      try {
        const response = await getAccounts();
        const foundAccount = response.data.data.find((item) => item._id === accountId);
        if (active) setAccount(foundAccount || null);
      } catch (requestError) {
        if (active) setError(extractError(requestError, t("accountTransactions.loadError")));
      }
    };

    loadAccount();
    return () => { active = false; };
  }, [accountId, t]);

  useEffect(() => {
    let active = true;
    const loadTransactions = async () => {
      setStatus("loading");
      setError(null);
      try {
        const end = filters.end ? `${filters.end}T23:59:59.999Z` : undefined;
        const response = await getAccountTransactions(accountId, {
          start: filters.start || undefined,
          end,
        });
        if (active) {
          setTransactions([...response.data.data].sort(
            (first, second) => new Date(second.date) - new Date(first.date),
          ));
          setStatus("succeeded");
        }
      } catch (requestError) {
        if (active) {
          setError(extractError(requestError, t("accountTransactions.loadError")));
          setStatus("failed");
        }
      }
    };

    loadTransactions();
    return () => { active = false; };
  }, [accountId, filters, t]);

  const updateFilter = (event) => {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const formatDate = (date) => new Intl.DateTimeFormat(i18n.language, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));

  const formatAmount = (transaction) => {
    const amount = Number(transaction.amount || 0);
    const value = transaction.type === "debit" ? -amount : amount;
    return new Intl.NumberFormat(i18n.language, {
      style: "currency",
      currency: account?.currency || "EGP",
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="transactions-page">
      <Link className="accounts-back-link" to="/accounts">
        {t("accountTransactions.backToAccounts")}
      </Link>

      <header className="transactions-heading">
        <div>
          <h1>{account?.name || t("accountTransactions.title")}</h1>
          {account && <p>{t(`accounts.${account.type}`)} · {account.currency}</p>}
        </div>
        {account && (
          <strong className={account.balance < 0 ? "negative-balance current-balance" : "current-balance"}>
            {new Intl.NumberFormat(i18n.language, {
              style: "currency",
              currency: account.currency || "EGP",
              maximumFractionDigits: 2,
            }).format(account.balance)}
          </strong>
        )}
      </header>

      <form className="transaction-filters" onSubmit={(event) => event.preventDefault()}>
        <label>
          {t("accountTransactions.from")}
          <input type="date" name="start" value={filters.start} onChange={updateFilter} />
        </label>
        <label>
          {t("accountTransactions.to")}
          <input type="date" name="end" value={filters.end} onChange={updateFilter} />
        </label>
        {(filters.start || filters.end) && (
          <button type="button" onClick={() => setFilters({ start: "", end: "" })}>
            {t("accountTransactions.clearFilter")}
          </button>
        )}
      </form>

      {status === "loading" && <p className="transactions-message">{t("accountTransactions.loading")}</p>}
      {error && <p className="auth-error">{error}</p>}
      {status === "succeeded" && transactions.length === 0 && (
        <p className="transactions-message">{t("accountTransactions.empty")}</p>
      )}

      {transactions.length > 0 && (
        <div className="transactions-table-wrap">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>{t("accountTransactions.date")}</th>
                <th>{t("accountTransactions.description")}</th>
                <th>{t("accountTransactions.amount")}</th>
                <th>{t("accountTransactions.balanceAfter")}</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td>{formatDate(transaction.date)}</td>
                  <td>{transaction.description || t("accountTransactions.untitled")}</td>
                  <td className={transaction.type === "debit" ? "negative-balance" : "positive-amount"}>
                    {formatAmount(transaction)}
                  </td>
                  <td>{new Intl.NumberFormat(i18n.language, {
                    style: "currency",
                    currency: account?.currency || "EGP",
                    maximumFractionDigits: 2,
                  }).format(transaction.balanceAfter)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AccountTransactionsPage;