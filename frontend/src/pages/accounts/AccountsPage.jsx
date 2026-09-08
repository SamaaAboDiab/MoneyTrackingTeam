import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  fetchAccounts,
  createAccount,
  toggleArchiveAccount,
  clearCreateAccountError,
  resetCreateAccountStatus,
} from "../../store/slices/accountsSlice";
import "../../App.css";

const DEFAULT_COLOR = "#0d9488";

function AccountsPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const {
    items,
    status,
    error,
    createStatus,
    createError,
  } = useSelector((state) => state.accounts);

  const [showArchived, setShowArchived] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "",
    balance: "",
    currency: "EGP",
    color: DEFAULT_COLOR,
  });

  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(resetCreateAccountStatus());
  }, [dispatch]);

  const handleChange = (event) => {
    if (createStatus === "succeeded" || createError) {
      dispatch(resetCreateAccountStatus());
      dispatch(clearCreateAccountError());
    }
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await dispatch(
      createAccount({
        ...form,
        balance: Number(form.balance),
        color: form.color || DEFAULT_COLOR,
      })
    );

    if (createAccount.fulfilled.match(result)) {
      setForm({
        name: "",
        type: "",
        balance: "",
        currency: "EGP",
        color: DEFAULT_COLOR,
      });
    }
  };

  const handleToggleArchive = (id) => {
    dispatch(toggleArchiveAccount(id));
  };

  // فلترة الحسابات حسب الحالة
  const activeAccounts = items.filter((account) => !account.isArchived);
  const archivedAccounts = items.filter((account) => account.isArchived);
  const displayedAccounts = showArchived ? archivedAccounts : activeAccounts;

  return (
    <div>
      <p>
        <Link to="/dashboard">{t("accounts.backToDashboard")}</Link>
      </p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>{t("accounts.title")}</h1>
        {createError && <p className="auth-error">{createError}</p>}
        {createStatus === "succeeded" && (
          <p className="auth-success">{t("accounts.success")}</p>
        )}

        <label htmlFor="name">{t("accounts.nameLabel")}</label>
        <input
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder={t("accounts.namePlaceholder")}
          maxLength="100"
          required
        />

        <label htmlFor="type">{t("accounts.typeLabel")}</label>
        <select id="type" name="type" value={form.type} onChange={handleChange} required>
          <option value="">{t("accounts.typePlaceholder")}</option>
          <option value="bank">{t("accounts.bank")}</option>
          <option value="wallet">{t("accounts.wallet")}</option>
          <option value="cash">{t("accounts.cash")}</option>
        </select>

        <label htmlFor="balance">{t("accounts.balanceLabel")}</label>
        <input
          id="balance"
          name="balance"
          type="number"
          step="0.01"
          value={form.balance}
          onChange={handleChange}
          required
        />

        <label htmlFor="currency">{t("accounts.currencyLabel")}</label>
        <select id="currency" name="currency" value={form.currency} onChange={handleChange} required>
          <option value="EGP">EGP</option>
          <option value="USD">USD</option>
          <option value="SAR">SAR</option>
          <option value="AED">AED</option>
        </select>

        <label htmlFor="color">{t("accounts.colorLabel")}</label>
        <input id="color" name="color" type="color" value={form.color} onChange={handleChange} />

        <button type="submit" disabled={createStatus === "loading"}>
          {createStatus === "loading" ? t("accounts.submitting") : t("accounts.submit")}
        </button>
      </form>

      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>{showArchived ? "الحسابات المؤرشفة" : t("accounts.listTitle")}</h2>
          <button type="button" onClick={() => setShowArchived(!showArchived)}>
            {showArchived ? "عرض الحسابات النشطة" : `عرض الحسابات المؤرشفة (${archivedAccounts.length})`}
          </button>
        </div>

        {status === "loading" && <p>{t("accounts.loading")}</p>}
        {error && <p className="auth-error">{error}</p>}
        {status === "succeeded" && displayedAccounts.length === 0 && (
          <p>{showArchived ? "لا توجد حسابات مؤرشفة." : t("accounts.empty")}</p>
        )}

        {displayedAccounts.map((account) => (
          <article key={account._id} style={{ opacity: account.isArchived ? 0.6 : 1 }}>
            <strong style={{ color: account.color }}>{account.name}</strong>
            <span> {t(`accounts.${account.type}`)}</span>
            <p>
              {t("accounts.balance")}: {account.balance.toLocaleString()} {account.currency}
            </p>
            <button type="button" onClick={() => handleToggleArchive(account._id)}>
              {account.isArchived ? "إعادة تفعيل" : "أرشفة"}
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}

export default AccountsPage;