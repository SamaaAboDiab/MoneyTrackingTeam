import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getAccountTransactions } from "../../api/accountsApi";
import { extractError } from "../../utils/errorHandler";
import "../../app/App.css";
import TransactionFilters from "./components/TransactionFilters";
import TransactionList from "./components/TransactionList";

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
    const loadInitialTransactions = async () => {
      await loadTransactions({ start: "", end: "" });
    };

    loadInitialTransactions();
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

      <TransactionFilters start={start} end={end} onStartChange={setStart} onEndChange={setEnd} onSubmit={(event) => { event.preventDefault(); loadTransactions(); }} t={t} />
      <TransactionList transactions={transactions} status={status} error={error} formatDate={formatDate} t={t} />
    </main>
  );
}

export default AccountHistoryPage;
