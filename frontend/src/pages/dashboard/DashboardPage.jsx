import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items, status } = useSelector((state) => state.accounts);
  const { items: debts, status: debtsStatus } = useSelector((state) => state.debts);
  const { data: summaryData, status: summaryStatus } = useSelector((state) => state.dashboard);

  const [period, setPeriod] = useState("month");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchDebts());
  }, [dispatch]);

  useEffect(() => {
    if (period === "custom" && (!from || !to || from > to)) return;
    dispatch(fetchDashboardSummary(period === "custom" ? { period, from, to } : { period }));
  }, [dispatch, period, from, to]);

  const activeAccounts = items.filter((account) => !account.isArchived);
  const totalsByCurrency = summaryData?.accountBalancesByCurrency || {};
  const totalCurrencies = Object.entries(totalsByCurrency);

  return (
    <div>
      <DashboardGreeting user={user} t={t} />
      <TotalWealthSection
        status={summaryStatus}
        totalCurrencies={totalCurrencies}
        onOpenAccounts={() => navigate("/accounts")}
        t={t}
      />
      <MonthlySummaryCard
        data={summaryData}
        status={summaryStatus}
        period={period}
        onPeriodChange={setPeriod}
        from={from}
        to={to}
        onFromChange={setFrom}
        onToChange={setTo}
        t={t}
      />
      <ExpenseCategoryChart categories={summaryData?.expenseCategories || []} t={t} />
      <DashboardDebtsCard debts={debts} debtSummary={summaryData?.debts} status={debtsStatus} />
      <QuickLinks t={t} />
      <AccountsPreview status={status} accounts={activeAccounts} t={t} />
    </div>
  );
}

export default DashboardPage;
