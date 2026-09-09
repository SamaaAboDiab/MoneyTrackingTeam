import AccountSelect from "./AccountSelect";
import TransferFeedback from "./TransferFeedback";

function TransferForm({ form, accounts, status, error, formError, lastTransfer, transferStatus, onChange, onSubmit, t }) {
  return (
    <form className="auth-form" onSubmit={onSubmit} style={{ maxWidth: 420 }}>
      <h1>{t("transfer.title")}</h1>
      {status === "loading" && <p>{t("transfer.loadingAccounts")}</p>}
      {error && !formError && <p className="auth-error">{error}</p>}
      {status === "succeeded" && accounts.length < 2 && <p className="auth-error">{t("transfer.needTwoAccounts")}</p>}
      <TransferFeedback status={transferStatus} error={error} formError={formError} lastTransfer={lastTransfer} t={t} />
      <AccountSelect id="fromId" name="fromId" label={t("transfer.fromLabel")} placeholder={t("transfer.fromPlaceholder")} accounts={accounts} value={form.fromId} onChange={onChange} />
      <AccountSelect id="toId" name="toId" label={t("transfer.toLabel")} placeholder={t("transfer.toPlaceholder")} accounts={accounts} value={form.toId} onChange={onChange} />
      <label htmlFor="amount">{t("transfer.amountLabel")}</label>
      <input id="amount" name="amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={onChange} required />
      <label htmlFor="description">{t("transfer.descriptionLabel")}</label>
      <input id="description" name="description" value={form.description} onChange={onChange} />
      <button type="submit" disabled={transferStatus === "loading"}>
        {transferStatus === "loading" ? t("transfer.submitting") : t("transfer.submit")}
      </button>
    </form>
  );
}

export default TransferForm;