import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  fetchAccounts,
  createAccount,
  adjustBalance,
  clearCreateAccountError,
  resetCreateAccountStatus,
} from "../../store/slices/accountsSlice";
import AdjustBalanceButton from "../../Components/AdjustBalanceModal";
import "../../App.css";

const DEFAULT_COLOR = "#0d9488";

// نجمع الأرصدة القادمة من API حسب العملة، لأن جمع USD مع EGP بدون سعر تحويل غير صحيح.
function calculateTotalsByCurrency(accounts) {
  return accounts.reduce((totals, account) => {
    const currency = account.currency || "UNKNOWN";
    const balance = Number(account.balance) || 0;
    totals[currency] = (totals[currency] || 0) + balance;
    return totals;
  }, {});
}

const accountTypeClassNames = {
  bank: "account-card account-card-bank",
  wallet: "account-card account-card-wallet",
  cash: "account-card account-card-cash",
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

  const handleAdjustBalance = ({ accountId, newBalance, notes }) =>
    dispatch(adjustBalance({ accountId, newBalance, notes })).unwrap();

  // items مصدرها state.accounts.items بعد fetchAccounts، لذلك الإجمالي يتغير تلقائيًا
  // بعد الإضافة أو تعديل الرصيد أو أي تحديث يرجع من الخادم إلى Redux.
  const totalsByCurrency = calculateTotalsByCurrency(items);
  const totalCurrencies = Object.entries(totalsByCurrency);

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
        <h2>{t("accounts.listTitle")}</h2>
        <aside className="wealth-summary" aria-label={t("accounts.totalWealth")}>
          <p className="wealth-summary-label">{t("accounts.totalWealth")}</p>
          {totalCurrencies.length === 0 ? (
            <strong className="wealth-summary-empty">{t("accounts.noBalance")}</strong>
          ) : (
            <div className="wealth-summary-values">
              {totalCurrencies.map(([currency, total]) => (
                <strong key={currency} className={total < 0 ? "amount-negative" : ""}>
                  {total.toLocaleString(undefined, { maximumFractionDigits: 2 })} {currency}
                </strong>
              ))}
            </div>
          )}
        </aside>
        {status === "loading" && <p>{t("accounts.loading")}</p>}
        {error && <p className="auth-error">{error}</p>}
        {status === "succeeded" && items.length === 0 && <p>{t("accounts.empty")}</p>}
        {items.map((account) => (
          <article key={account._id} className={accountTypeClassNames[account.type] || "account-card"}>
            <div className="account-card-header">
              <strong style={{ color: account.color }}>{account.name}</strong>
              <span className="account-type-badge">{t(`accounts.${account.type}`)}</span>
            </div>
            <p className={Number(account.balance) < 0 ? "account-balance amount-negative" : "account-balance"}>
              {t("accounts.balance")}: {Number(account.balance).toLocaleString(undefined, { maximumFractionDigits: 2 })} {account.currency}
            </p>
            <AdjustBalanceButton account={account} onSubmit={handleAdjustBalance} />
          </article>
        ))}
      </section>
    </div>
  );
}

export default AccountsPage;
