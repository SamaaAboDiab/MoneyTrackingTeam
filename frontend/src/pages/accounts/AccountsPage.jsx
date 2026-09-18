import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Wallet } from "lucide-react"; // ⬅️ جديد

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
import CashWithdrawalForm from "../cash/CashWithdrawalForm"; // ⬅️ جديد — عدّلي المسار لو مختلف

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
  const [showWithdrawModal, setShowWithdrawModal] = useState(false); // ⬅️ جديد

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

  // ⬅️ جديد: بعد نجاح السحب، حدّثي قائمة الحسابات في الـ Redux store
  const handleWithdrawSuccess = () => {
    dispatch(fetchAccounts());
    setTimeout(() => setShowWithdrawModal(false), 1500); // سيبي رسالة النجاح تتشاف الأول
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{t("accounts.title")}</h1>
          <p className="mt-1 text-slate-500">{t("accounts.formDescription")}</p>
        </div>
        <div className="flex items-center gap-4"> {/* ⬅️ جديد */}
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 font-semibold text-white transition hover:bg-brand-700"
          >
            <Wallet size={18} />
            {t("cash.withdrawButton")}
          </button>
          <Link to="/dashboard" className="font-semibold text-brand-700 hover:underline">
            {t("common.backToDashboard")}
          </Link>
        </div>
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

      
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <CashWithdrawalForm
            onSuccess={handleWithdrawSuccess}
            onClose={() => setShowWithdrawModal(false)}
          />
        </div>
      )}
    </div>
  );
}

export default AccountsPage;