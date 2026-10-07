import { useTranslation } from "react-i18next";
import { formatAmount, currencyLabel } from "../../../utils/formatAmount";
import { errorClass } from "../constants";

function IncomeTotalCard({ displayedTotal, totalsByCurrency, summaryCurrency, summaryStatus, summaryError }) {
  const { t } = useTranslation();

  return (
    <>
    <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {t("income.totalLabel")}
          </p>

          {summaryCurrency === "ALL" ? (
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
              {Object.entries(totalsByCurrency || {}).map(([currency, total]) => (
                <div key={currency} className="flex items-baseline gap-2">
                  <strong className="tabular-amount text-2xl font-extrabold text-slate-900">
                    {formatAmount(total)}
                  </strong>
                  <span className="text-sm font-medium text-slate-500">{currencyLabel(currency)}</span>
                </div>
              ))}
              {Object.keys(totalsByCurrency || {}).length === 0 && (
                <strong className="tabular-amount text-2xl font-extrabold text-slate-900">
                  {formatAmount(0)}
                </strong>
              )}
            </div>
          ) : (
            <div className="mt-1 flex items-baseline gap-2">
              <strong className="tabular-amount text-3xl font-extrabold text-slate-900">
                {formatAmount(displayedTotal)}
              </strong>
              <span className="text-sm font-medium text-slate-500">
                {currencyLabel(summaryCurrency)}
              </span>
            </div>
          )}
        </div>
      </div>

      {summaryStatus === "loading" && (
        <p className="mt-3 text-sm text-slate-500">
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
