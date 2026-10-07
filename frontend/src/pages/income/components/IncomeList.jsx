import { formatMoney, formatNumber } from "../../../utils/formatAmount";
import IncomeItem from "./IncomeItem";
import { ListSkeleton } from "../../../components/common/Skeleton";

function IncomeList({
  items,
  status,
  error,
  displayCurrency,
  totalAmount,
  totalsByCurrency,
  onEdit,
  onDeleted,
  onToggled,
  t,
}) {
  const calculatedTotal = items.reduce((sum, income) => {
    const currency = income.currency || "EGP";
    sum[currency] = (sum[currency] || 0) + Number(income.monthlyAmount ?? income.amount ?? 0);
    return sum;
  }, {});
  return (
    <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-slate-900">{t("income.listTitle")}</h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
          {formatNumber(items.length)}
        </span>
      </div>

      {status === "loading" && <ListSkeleton rows={4} className="mt-2" label={t("income.loading")} />}
      {error && (
        <p className="mt-4 rounded-xl bg-expense-soft px-4 py-2.5 text-sm font-medium text-expense">
          {error}
        </p>
      )}
      {status === "succeeded" && items.length === 0 && (
        <p className="mt-4 text-slate-500">{t("income.empty")}</p>
      )}

      <div className="mt-2 flex flex-col divide-y divide-slate-100">
        {items.map((income) => (
          <IncomeItem
            key={income._id}
            income={income}
            displayAmount={income.monthlyAmount ?? income.convertedAmount ?? income.amount}
            displayCurrency={displayCurrency === "ALL" ? income.currency || "EGP" : displayCurrency}
            amountLabel={displayCurrency === "ALL" ? "income.fields.amount" : "income.fields.amountConverted"}
            onEdit={onEdit}
            onDeleted={onDeleted}
            onToggled={onToggled}
          />
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <span className="font-bold text-slate-700">
          {t(displayCurrency === "ALL" ? "income.totalByCurrencyLabel" : "income.totalConvertedLabel")}
        </span>
        <div className="flex flex-wrap justify-end gap-x-4 gap-y-2">
          {displayCurrency === "ALL"
            ? Object.entries(totalsByCurrency || calculatedTotal).map(([currency, total]) => (
              <strong key={currency} className="tabular-amount text-lg font-extrabold text-income">
                {formatMoney(total, currency, { minimumFractionDigits: 2 })}
              </strong>
            ))
            : (
              <strong className="tabular-amount text-xl font-extrabold text-income">
                {formatMoney(totalAmount ?? Object.values(calculatedTotal).reduce((sum, total) => sum + total, 0), displayCurrency, { minimumFractionDigits: 2 })}
              </strong>
            )}
          {displayCurrency === "ALL" && Object.keys(totalsByCurrency || calculatedTotal).length === 0 && (
            <strong className="tabular-amount text-lg font-extrabold text-income">{formatMoney(0, "EGP")}</strong>
          )}
        </div>
      </div>
    </section>
  );
}

export default IncomeList;
