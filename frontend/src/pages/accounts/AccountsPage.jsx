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

import AdjustBalanceButton from "./components/AdjustBalanceModal";

import "../../app/App.css";

const DEFAULT_COLOR = "#4f46e5";

const accountTypeClassNames = {
  bank: "account-card account-card-bank",
  wallet: "account-card account-card-wallet",
  cash: "account-card account-card-cash",
};

const calculateTotalsByCurrency = (accounts) => {
  return accounts.reduce((totals, account) => {
    const currency = account.currency || "EGP";
    const balance = Number(account.balance) || 0;

    totals[currency] = (totals[currency] || 0) + balance;

    return totals;
  }, {});
};

function AccountsPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const {
    items,
    status,
    error,
    createStatus,
    createError,
    adjustStatus,
  } = useSelector((state) => state.accounts);

  const [showArchived, setShowArchived] = useState(false);

  const [form, setForm] = useState({
    name: "",
    type: "",
    initialBalance: "",
    currency: "EGP",
    color: DEFAULT_COLOR,
  });

  useEffect(() => {
    dispatch(fetchAccounts());

    return () => {
      dispatch(resetCreateAccountStatus());
    };
  }, [dispatch]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const result = await dispatch(
      createAccount({
        name: form.name.trim(),
        type: form.type,
        balance: Number(form.initialBalance),
        currency: form.currency,
        color: form.color || DEFAULT_COLOR,
      })
    );

    if (createAccount.fulfilled.match(result)) {
      setForm({
        name: "",
        type: "",
        initialBalance: "",
        currency: "EGP",
        color: DEFAULT_COLOR,
      });
    }
  };

  const handleAdjustBalance = async ({ accountId, newBalance, notes }) => {
    return dispatch(
      adjustBalance({
        accountId,
        newBalance,
        notes,
      })
    ).unwrap();
  };

  const handleToggleArchive = async (accountId) => {
    await dispatch(toggleArchiveAccount(accountId));
  };

  const totalsByCurrency = calculateTotalsByCurrency(items);

  const totalCurrencies = Object.entries(totalsByCurrency);

  const activeAccounts = items.filter(
    (account) => !account.isArchived
  );

  const archivedAccounts = items.filter(
    (account) => account.isArchived
  );

  const displayedAccounts = showArchived
    ? archivedAccounts
    : activeAccounts;

  return (
    <div className="accounts-page">
      <div className="accounts-container">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1>{t("accounts.title")}</h1>
            <p className="accounts-page-subtitle">
              {t("accounts.formDescription")}
            </p>
          </div>

          <Link to="/dashboard" className="back-link">
            {t("common.backToDashboard")}
          </Link>
        </div>

        {/* Add Account Form */}
        <section className="accounts-form-section">
          <h2>{t("accounts.submit")}</h2>

          <form onSubmit={handleSubmit} className="accounts-form">
            {/* Account Name */}
            <div className="form-group">
              <label htmlFor="name">
                {t("accounts.nameLabel")}
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder={t("accounts.namePlaceholder")}
                required
              />
            </div>

            {/* Account Type */}
            <div className="form-group">
              <label htmlFor="type">
                {t("accounts.typeLabel")}
              </label>

              <select
                id="type"
                name="type"
                value={form.type}
                onChange={handleChange}
                required
              >
                <option value="">
                  {t("accounts.typePlaceholder")}
                </option>

                <option value="bank">
                  {t("accounts.bank")}
                </option>

                <option value="wallet">
                  {t("accounts.wallet")}
                </option>

                <option value="cash">
                  {t("accounts.cash")}
                </option>
              </select>
            </div>

            {/* Initial Balance */}
            <div className="form-group">
              <label htmlFor="initialBalance">
                {t("accounts.balanceLabel")}
              </label>

              <input
                id="initialBalance"
                name="initialBalance"
                type="number"
                step="0.01"
                value={form.initialBalance}
                onChange={handleChange}
                placeholder="0"
                required
              />
            </div>

            {/* Currency */}
            <div className="form-group">
              <label htmlFor="currency">
                {t("accounts.currencyLabel")}
              </label>

              <select
                id="currency"
                name="currency"
                value={form.currency}
                onChange={handleChange}
                required
              >
                <option value="EGP">EGP</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>

            {/* Color */}
            <div className="form-group">
              <label htmlFor="color">
                {t("accounts.colorLabel")}
              </label>

              <input
                id="color"
                name="color"
                type="color"
                value={form.color}
                onChange={handleChange}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="primary-button"
              disabled={createStatus === "loading"}
            >
              {createStatus === "loading"
                ? t("accounts.submitting")
                : t("accounts.submit")}
            </button>

            {createError && (
              <p className="auth-error">
                {createError}
              </p>
            )}
          </form>
        </section>

        {/* Wealth Summary */}
        <section className="accounts-summary">
          <h2>{t("accounts.totalWealth")}</h2>

          {totalCurrencies.length === 0 ? (
            <p>{t("accounts.noBalance")}</p>
          ) : (
            <div className="summary-list">
              {totalCurrencies.map(([currency, total]) => (
                <div
                  key={currency}
                  className="summary-item"
                >
                  <span>{currency}</span>

                  <strong>
                    {Number(total).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Accounts Section */}
        <section className="accounts-list-section">
          <div className="accounts-list-header">
            <div>
              <h2>{t("accounts.listTitle")}</h2>

              <p className="accounts-list-status">
                {showArchived ? "الحسابات المؤرشفة" : "الحسابات النشطة"}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowArchived((prev) => !prev)
              }
              className="secondary-button"
            >
              {showArchived
                ? "عرض الحسابات النشطة"
                : "عرض الحسابات المؤرشفة"}
            </button>
          </div>

          {/* Loading */}
          {status === "loading" && (
            <p>{t("accounts.loading")}</p>
          )}

          {/* Error */}
          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}

          {/* Empty State */}
          {status === "succeeded" &&
            displayedAccounts.length === 0 && (
              <p>
                {showArchived
                  ? "لا توجد حسابات مؤرشفة."
                  : t("accounts.empty")}
              </p>
            )}

          {/* Accounts */}
          {displayedAccounts.map((account) => (
            <article
              key={account._id}
              className={
                accountTypeClassNames[account.type] ||
                "account-card"
              }
              style={{
                opacity: account.isArchived ? 0.6 : 1,
              }}
            >
              {/* Transaction History Link */}
              <Link
                to={`/accounts/${account._id}/transactions`}
                className="account-history-link"
              >
                <div className="account-card-header">
                  <strong
                    style={{
                      color: account.color,
                    }}
                  >
                    {account.name}
                  </strong>

                  <span className="account-type-badge">
                    {t(`accounts.${account.type}`)}
                  </span>
                </div>

                <p
                  className={
                    Number(account.balance) < 0
                      ? "account-balance amount-negative"
                      : "account-balance"
                  }
                >
                  {t("accounts.balance")}:{" "}
                  {Number(account.balance).toLocaleString(
                    undefined,
                    {
                      maximumFractionDigits: 2,
                    }
                  )}{" "}
                  {account.currency}
                </p>
              </Link>

              {/* Adjust Balance */}
              {!account.isArchived && (
                <AdjustBalanceButton
                  account={account}
                  onSubmit={handleAdjustBalance}
                  disabled={adjustStatus === "loading"}
                />
              )}

              {/* Archive / Reactivate */}
              <button
                type="button"
                className="account-archive-button"
                onClick={() =>
                  handleToggleArchive(
                    account._id,
                    account.isArchived
                  )
                }
              >
                {account.isArchived
                  ? "إعادة تفعيل"
                  : "أرشفة"}
              </button>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}

export default AccountsPage;