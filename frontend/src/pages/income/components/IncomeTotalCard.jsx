import { useTranslation } from "react-i18next";
import { formatAmount, currencyLabel, currencyName } from "../../../utils/formatAmount";
import { errorClass } from "../constants";

function IncomeTotalCard({ displayedTotal, totalsByCurrency, summaryCurrency, summaryStatus, summaryError }) {
  const { t } = useTranslation();

  return (
    <>
    <section className="mt-6 rounded-2xl bg-linear-to-br from-navy-800 to-navy-900 p-6 text-white shadow-2xl">
      <div>
        <div>
          <p className="text-sm font-medium text-slate-300">
            {t("income.totalLabel")}
          </p>

          {summaryCurrency === "ALL" ? (
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Object.entries(totalsByCurrency || {}).map(([currency, total]) => (
                <div key={currency} className="rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
                  <p className="text-xs font-semibold text-slate-400">{currencyName(currency)}</p>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <strong className="tabular-amount text-2xl font-extrabold text-white">
                      {formatAmount(total)}
                    </strong>
                    <span className="text-sm font-semibold text-brand-400">{currencyLabel(currency)}</span>
                  </div>
                </div>
              ))}
              {Object.keys(totalsByCurrency || {}).length === 0 && (
                <strong className="tabular-amount text-2xl font-extrabold text-white">
                  {formatAmount(0)}
                </strong>
              )}
            </div>
          ) : (
            <div className="mt-1 flex items-baseline gap-2">
              <strong className="tabular-amount text-3xl font-extrabold text-white">
                {formatAmount(displayedTotal)}
              </strong>
              <span className="text-sm font-semibold text-brand-400">
                {currencyLabel(summaryCurrency)}
              </span>
            </div>
          )}
        </div>
      </div>

      {summaryStatus === "loading" && (
        <p className="mt-3 text-sm text-slate-400">
          {t("income.summaryUpdating")}
        </p>
      )}

      {summaryError && (
        <p className={`mt-3 ${errorClass}`}>
          {summaryError}
        </p>
      )}
    </section>
    </>
  );
}

export default IncomeTotalCard;
