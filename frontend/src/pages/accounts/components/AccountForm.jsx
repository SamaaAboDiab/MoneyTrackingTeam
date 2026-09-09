function AccountForm({ form, createStatus, createError, onChange, onSubmit, t }) {
  return (
    <section className="accounts-form-section">
      <h2>{t("accounts.submit")}</h2>
      <form onSubmit={onSubmit} className="accounts-form">
        <div className="form-group">
          <label htmlFor="name">{t("accounts.nameLabel")}</label>
          <input id="name" name="name" type="text" value={form.name} onChange={onChange} placeholder={t("accounts.namePlaceholder")} required />
        </div>
        <div className="form-group">
          <label htmlFor="type">{t("accounts.typeLabel")}</label>
          <select id="type" name="type" value={form.type} onChange={onChange} required>
            <option value="">{t("accounts.typePlaceholder")}</option>
            <option value="bank">{t("accounts.bank")}</option>
            <option value="wallet">{t("accounts.wallet")}</option>
            <option value="cash">{t("accounts.cash")}</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="initialBalance">{t("accounts.balanceLabel")}</label>
          <input id="initialBalance" name="initialBalance" type="number" step="0.01" value={form.initialBalance} onChange={onChange} placeholder="0" required />
        </div>
        <div className="form-group">
          <label htmlFor="currency">{t("accounts.currencyLabel")}</label>
          <select id="currency" name="currency" value={form.currency} onChange={onChange} required>
            <option value="EGP">EGP</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="color">{t("accounts.colorLabel")}</label>
          <input id="color" name="color" type="color" value={form.color} onChange={onChange} />
        </div>
        <button type="submit" className="primary-button" disabled={createStatus === "loading"}>
          {createStatus === "loading" ? t("accounts.submitting") : t("accounts.submit")}
        </button>
        {createError && <p className="auth-error">{createError}</p>}
      </form>
    </section>
  );
}

export default AccountForm;