import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  fetchAccounts,
  createAccount,
  clearCreateAccountError,
  resetCreateAccountStatus,
} from "../../store/slices/accountsSlice";
import "./AccountsPage.css";

const DEFAULT_COLOR = "#0d9488";

function AccountsPage() {
  const { t } = useTranslation();
  const { i18n } = useTranslation();
  const dispatch = useDispatch();
  const {
    items,
    status,
    error,
    createStatus,
    createError,
  } = useSelector((state) => state.accounts);
  const [form, setForm] = useState({
    name: "",
    type: "",
    balance: "",
    currency: "EGP",
    color: DEFAULT_COLOR,
  });

  useEffect(() => {
    dispatch(fetchAccounts());
    // بنصفّر حالة أي عملية إضافة قديمة عشان رسالة نجاح/خطأ من زيارة سابقة للصفحة متفضلش ظاهرة.
    dispatch(resetCreateAccountStatus());
  }, [dispatch]);

  const handleChange = (event) => {
    // لو فيه رسالة نجاح/خطأ من محاولة سابقة، امسحها أول ما المستخدم يبدأ يكتب من جديد.
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

  const accountsByType = ["bank", "wallet", "cash"].map((type) => ({
    type,
    accounts: items.filter((account) => account.type === type),
  }));
  const currencies = items.reduce((totals, account) => {
    const currency = account.currency || "EGP";
    totals[currency] = (totals[currency] || 0) + Number(account.balance || 0);
    return totals;
  }, {});
  const baseCurrency = items[0]?.currency || "EGP";
  const totalBalance = currencies[baseCurrency] || 0;
  const formatBalance = (value, currency) =>
    new Intl.NumberFormat(i18n.language, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value);

  return (
    <div className="accounts-page">
      <div className="accounts-heading">
        <div>
          <Link className="accounts-back-link" to="/dashboard">
            {t("accounts.backToDashboard")}
          </Link>
          <h1>{t("accounts.title")}</h1>
          <p className="accounts-subtitle">{t("accounts.subtitle")}</p>
        </div>
        <span className="accounts-count">{items.length} {t("accounts.accountCount")}</span>
      </div>

      {status === "loading" && <p className="accounts-feedback">{t("accounts.loading")}</p>}
      {error && <p className="auth-error">{error}</p>}

      {status === "succeeded" && items.length > 0 && (
        <>
          <section className="wealth-summary" aria-label={t("accounts.totalWealth")}>
            <div>
              <span className="summary-label">{t("accounts.totalWealth")}</span>
              <strong className={totalBalance < 0 ? "negative-balance summary-value" : "summary-value"}>
                {formatBalance(totalBalance, baseCurrency)}
              </strong>
              <span className="summary-note">{t("accounts.baseCurrency", { currency: baseCurrency })}</span>
            </div>
            <div className="currency-totals">
              {Object.entries(currencies).map(([currency, total]) => (
                <span key={currency} className={total < 0 ? "negative-balance" : ""}>
                  {formatBalance(total, currency)}
                </span>
              ))}
            </div>
          </section>

          <section className="account-groups" aria-label={t("accounts.listTitle")}>
            {accountsByType.map(({ type, accounts }) => accounts.length > 0 && (
              <div className={`account-group account-group-${type}`} key={type}>
                <div className="account-group-heading">
                  <h2>{t(`accounts.${type}`)}</h2>
                  <span>{accounts.length}</span>
                </div>
                <div className="account-grid">
                  {accounts.map((account) => {
                    const balance = Number(account.balance || 0);
                    return (
                      <Link
                        className="account-card-link"
                        key={account._id}
                        to={`/accounts/${account._id}/transactions`}
                      >
                        <article className="account-card">
                        <div className="account-card-top">
                          <span className="account-color" style={{ backgroundColor: account.color || DEFAULT_COLOR }} />
                          <span className="account-type-label">{t(`accounts.${account.type}`)}</span>
                        </div>
                        <h3>{account.name}</h3>
                        <strong className={balance < 0 ? "negative-balance account-balance" : "account-balance"}>
                          {formatBalance(balance, account.currency || "EGP")}
                        </strong>
                        {account.isArchived && <span className="account-archived">{t("accounts.archived")}</span>}
                        </article>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        </>
      )}

      {status === "succeeded" && items.length === 0 && (
        <p className="accounts-empty">{t("accounts.empty")}</p>
      )}

      <form className="auth-form account-form" onSubmit={handleSubmit}>
        <h2>{t("accounts.addTitle")}</h2>
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
    </div>
  );
}

export default AccountsPage;
