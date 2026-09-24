import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { fetchAccounts } from "../../store/slices/accountsSlice";
import { fetchDebts } from "../../store/slices/debtsSlice";
import { fetchDashboardSummary } from "../../store/slices/dashboardSlice";
import DashboardGreeting from "./components/DashboardGreeting";
import TotalWealthSection from "./components/TotalWealthSection";
import QuickLinks from "./components/QuickLinks";
import AccountsPreview from "./components/AccountsPreview";
import DashboardDebtsCard from "./components/DashboardDebtsCard";
import MonthlySummaryCard from "./components/MonthlySummaryCard";
import ExpenseCategoryChart from "./components/ExpenseCategoryChart";

function DashboardPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items, status } = useSelector((state) => state.accounts);
  const { items: debts, status: debtsStatus } = useSelector((state) => state.debts);
  const { data: summaryData, status: summaryStatus } = useSelector((state) => state.dashboard);

  const [period, setPeriod] = useState("month");

  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchDebts());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchDashboardSummary({ period }));
  }, [dispatch, period]);

  const activeAccounts = items.filter((account) => !account.isArchived);
  const totalsByCurrency = activeAccounts.reduce((totals, account) => {
    const currency = account.currency || "EGP";
    totals[currency] = (totals[currency] || 0) + (Number(account.balance) || 0);
    return totals;
  }, {});
  const totalCurrencies = Object.entries(totalsByCurrency);

  return (
    <div>
      <DashboardGreeting user={user} t={t} />
      <TotalWealthSection status={status} totalCurrencies={totalCurrencies} t={t} />
      <MonthlySummaryCard
        data={summaryData}
        status={summaryStatus}
        period={period}
        onPeriodChange={setPeriod}
        t={t}
      />
      <ExpenseCategoryChart categories={summaryData?.expenseCategories || []} t={t} />
      <DashboardDebtsCard debts={debts} status={debtsStatus} />
      <QuickLinks t={t} />
      <AccountsPreview status={status} accounts={activeAccounts} t={t} />
    </div>
  );
}

export default DashboardPage;
