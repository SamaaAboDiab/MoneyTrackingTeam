import { useTranslation } from "react-i18next";
import { formatAmount, formatMoney, currencyLabel } from "../../../utils/formatAmount";

// totalsByCurrency: [[currency, total], ...], largest first. The first is shown big,
// any other currencies as chips — amounts in different currencies are never added up.
function ExpensesSummary({ isFiltered, totalsByCurrency = [] }) {
  const { t } = useTranslation();
  const [primary = ["EGP", 0], ...others] = totalsByCurrency;
  const [primaryCurrency, primaryTotal] = primary;

  return (
    <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100">
      <p className="text-sm font-medium text-slate-500">
        {t("expenses.totalLabel")} {isFiltered && t("expenses.totalFilteredSuffix")}
      </p>
      <div className="mt-1 flex items-baseline gap-2">
        <strong className="tabular-amount text-3xl font-extrabold text-slate-900">
          {formatAmount(primaryTotal)}
        </strong>
        <span className="text-sm font-medium text-slate-500">{currencyLabel(primaryCurrency)}</span>
      </div>
      {others.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {others.map(([code, total]) => (
            <span key={code} className="tabular-amount rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
              + {formatMoney(total, code)}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

export default ExpensesSummary;
