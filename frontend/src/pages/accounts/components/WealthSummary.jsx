import { formatNumber, currencyLabel } from "../../../utils/formatAmount";

function WealthSummary({ accounts, t }) {
  const totalsByCurrency = accounts.reduce((totals, account) => {
    const currency = account.currency || "EGP";
    totals[currency] = (totals[currency] || 0) + (Number(account.balance) || 0);
    return totals;
  }, {});
  const currencies = Object.entries(totalsByCurrency);

  return (
    <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
      <h2 className="text-lg font-bold text-slate-900">{t("accounts.totalWealth")}</h2>

      {currencies.length === 0 ? (
        <p className="mt-3 text-slate-500">{t("accounts.noBalance")}</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
          {currencies.map(([currency, total]) => (
            <div key={currency} className="flex items-baseline gap-2">
              <strong className="tabular-amount text-2xl font-extrabold text-slate-900">{formatNumber(total)}</strong>
              <span className="text-sm font-medium text-slate-500">{currencyLabel(currency)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default WealthSummary;
