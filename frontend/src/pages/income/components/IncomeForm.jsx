function IncomeForm({ form, createStatus, createError, onChange, onSubmit, t }) {
  return (
    <section className="income-panel">
      <h2>{t("income.formTitle")}</h2>
      <form className="income-form" onSubmit={onSubmit}>
        <div className="income-form-field">
          <label htmlFor="income-name">{t("income.nameLabel")}</label>
          <input id="income-name" name="name" value={form.name} onChange={onChange} placeholder={t("income.namePlaceholder")} maxLength={100} required />
        </div>
        <div className="income-form-field">
          <label htmlFor="income-category">{t("income.categoryLabel")}</label>
          <select id="income-category" name="category" value={form.category} onChange={onChange} required>
            <option value="">{t("income.categoryPlaceholder")}</option>
            {["salary", "freelance", "rental", "investment", "other"].map((category) => (
              <option key={category} value={category}>{t(`income.categories.${category}`)}</option>
            ))}
          </select>
        </div>
        <div className="income-form-field">
          <label htmlFor="income-amount">{t("income.amountLabel")}</label>
          <input id="income-amount" name="amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={onChange} required />
        </div>
        <div className="income-form-field">
          <label htmlFor="income-currency">{t("income.currencyLabel")}</label>
          <select id="income-currency" name="currency" value={form.currency} onChange={onChange} required>
            <option value="EGP">EGP</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
        <div className="income-form-field">
          <label htmlFor="income-date">{t("income.receivedDateLabel")}</label>
          <input id="income-date" name="receivedDate" type="date" value={form.receivedDate} onChange={onChange} required />
        </div>
        <div className="income-form-field income-form-field-wide">
          <label htmlFor="income-notes">{t("income.notesLabel")}</label>
          <textarea id="income-notes" name="notes" value={form.notes} onChange={onChange} placeholder={t("income.notesPlaceholder")} maxLength={500} rows="3" />
        </div>
        <div className="income-form-actions">
          <button type="submit" className="income-primary-button" disabled={createStatus === "loading"}>
            {createStatus === "loading" ? t("income.submitting") : t("income.submit")}
          </button>
          {createStatus === "succeeded" && <p className="income-success" role="status">{t("income.success")}</p>}
          {createError && <p className="income-error">{createError}</p>}
        </div>
      </form>
    </section>
  );
}

export default IncomeForm;