import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { fetchAccounts } from "../../store/slices/accountsSlice";
import DashboardGreeting from "./components/DashboardGreeting";
import TotalWealthSection from "./components/TotalWealthSection";
import QuickLinks from "./components/QuickLinks";
import AccountsPreview from "./components/AccountsPreview";
import CashBalanceWidget from "./components/CashBalanceWidget";

function DashboardPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { items, status } = useSelector((state) => state.accounts);

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  const activeAccounts = items.filter((account) => !account.isArchived);
  const cashAccount = activeAccounts.find((account) => account.type === "cash");
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
      {status !== "loading" && <CashBalanceWidget cashAccount={cashAccount} t={t} />}
      <QuickLinks t={t} />
      <AccountsPreview status={status} accounts={activeAccounts} t={t} />
    </div>
  );
}

export default DashboardPage;
