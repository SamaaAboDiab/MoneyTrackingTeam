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

const DEFAULT_COLOR = "#4f46e5";
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
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{t("accounts.title")}</h1>
          <p className="mt-1 text-slate-500">{t("accounts.formDescription")}</p>
        </div>
        <Link to="/dashboard" className="font-semibold text-brand-700 hover:underline">
          {t("common.backToDashboard")}
        </Link>
      </div>

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
