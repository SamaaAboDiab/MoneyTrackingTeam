function WealthSummary({ accounts, t }) {
  const totalsByCurrency = accounts.reduce((totals, account) => {
    const currency = account.currency || "EGP";
    totals[currency] = (totals[currency] || 0) + (Number(account.balance) || 0);
    return totals;
  }, {});
  const currencies = Object.entries(totalsByCurrency);

  return (
    <section className="accounts-summary">
      <h2>{t("accounts.totalWealth")}</h2>
      {currencies.length === 0 ? <p>{t("accounts.noBalance")}</p> : (
        <div className="summary-list">
          {currencies.map(([currency, total]) => (
            <div key={currency} className="summary-item">
              <span>{currency}</span>
              <strong>{Number(total).toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default WealthSummary;