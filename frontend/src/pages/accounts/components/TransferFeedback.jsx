function TransferFeedback({ status, error, formError, lastTransfer, t }) {
  if (formError || error) return <p className="auth-error">{formError || error}</p>;
  if (status !== "succeeded" || !lastTransfer) return null;

  return (
    <p className="auth-success">
      {t("transfer.successMessage", {
        fromName: lastTransfer.from.name,
        fromBalance: lastTransfer.from.balance.toLocaleString(),
        fromCurrency: lastTransfer.from.currency,
        toName: lastTransfer.to.name,
        toBalance: lastTransfer.to.balance.toLocaleString(),
        toCurrency: lastTransfer.to.currency,
      })}
    </p>
  );
}

export default TransferFeedback;