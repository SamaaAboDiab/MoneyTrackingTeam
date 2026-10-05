import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

import {
  createAccount,
  fetchAccounts,
  resetCreateAccountStatus,
  adjustBalance,
  toggleArchiveAccount,
} from "../../store/slices/accountsSlice";
import AccountForm from "./components/AccountForm";
import AccountsList from "./components/AccountsList";
import WealthSummary from "./components/WealthSummary";
import PageHeader from "../../components/common/PageHeader";
import { Wallet, ArrowLeftRight } from "lucide-react";

const DEFAULT_COLOR = "#334155";
const emptyForm = {
  name: "",
  type: "",
  initialBalance: "",
  currency: "EGP",
  color: DEFAULT_COLOR,
};

function AccountsPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { items, status, error, createStatus, createError, adjustStatus } = useSelector(
    (state) => state.accounts
  );
  const [showArchived, setShowArchived] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    dispatch(fetchAccounts());
    return () => dispatch(resetCreateAccountStatus());
  }, [dispatch]);

  const handleChange = ({ target }) => {
    setForm((previous) => ({ ...previous, [target.name]: target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await dispatch(createAccount({
      name: form.name.trim(),
      type: form.type,
      balance: Number(form.initialBalance),
      currency: form.currency,
      color: form.color || DEFAULT_COLOR,
    }));
    if (createAccount.fulfilled.match(result)) setForm(emptyForm);
  };

  const handleAdjustBalance = ({ accountId, newBalance, notes }) =>
    dispatch(adjustBalance({ accountId, newBalance, notes })).unwrap();

  const handleToggleArchive = (accountId) => dispatch(toggleArchiveAccount(accountId));
  const displayedAccounts = items.filter((account) => Boolean(account.isArchived) === showArchived);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        icon={Wallet}
        title={t("accounts.title")}
        subtitle={t("accounts.formDescription")}
        actions={
          <Link to="/accounts/transfer" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-brand-600/25 transition hover:bg-brand-700">
            <ArrowLeftRight size={16} />
            {t("layout.quickActionLabel")}
          </Link>
        }
      />

      <AccountForm form={form} createStatus={createStatus} createError={createError} onChange={handleChange} onSubmit={handleSubmit} t={t} />
      <WealthSummary accounts={items} t={t} />
      <AccountsList
        accounts={displayedAccounts}
        showArchived={showArchived}
        status={status}
        error={error}
        adjustStatus={adjustStatus}
        onToggleView={() => setShowArchived((previous) => !previous)}
        onAdjust={handleAdjustBalance}
        onToggleArchive={handleToggleArchive}
        t={t}
      />
    </div>
  );
}

export default AccountsPage;
