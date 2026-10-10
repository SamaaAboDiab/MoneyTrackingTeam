import { currencyLabel, currencyName, formatAmount, formatMoney, formatNumber } from "../../../utils/formatAmount";
import IncomeItem, { INCOME_COLUMNS } from "./IncomeItem";
import { ListSkeleton } from "../../../components/common/Skeleton";

// One currency's total. Mali: the amount inline. Emerald: a tile with the code badge and name.
function CurrencyTotal({ currency, total, large = false, inlineOptions = { minimumFractionDigits: 2 } }) {
  return (
    <>
    <strong className={`tabular-amount font-extrabold text-income emerald:hidden ${large ? "text-xl" : "text-lg"}`}>
      {formatMoney(total, currency, inlineOptions)}
    </strong>
    <div className="hidden items-center gap-3 rounded-xl bg-income-soft/50 p-3 ring-1 ring-income/10 sm:p-4 emerald:flex">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-extrabold tracking-wide text-income shadow-sm ring-1 ring-income/15">
        {currency}
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-slate-500">{currencyName(currency)}</p>
        <p className="mt-0.5 flex items-baseline gap-1.5">
          <strong className="tabular-amount truncate text-lg font-extrabold text-income">
            {formatAmount(total, { minimumFractionDigits: 2 })}
          </strong>
          <span className="text-xs font-semibold text-income/80">{currencyLabel(currency)}</span>
        </p>
      </div>
    </div>
    </>
  );
}

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
    <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100 emerald:ring-slate-200/80">
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

      {items.length > 0 && (
        // Column headings once, above the rows (md and up; phones show each row as a small card).
        <div
          aria-hidden="true"
          className={`mt-5 hidden rounded-lg bg-slate-50 px-4 py-2.5 text-[11px] font-semibold text-slate-500 ${INCOME_COLUMNS}`}
        >
          <span>{t("income.fields.name")}</span>
          <span>{t("income.fields.category")}</span>
          <span>{t(displayCurrency === "ALL" ? "income.fields.amount" : "income.fields.amountConverted")}</span>
          <span>{t("income.fields.date")}</span>
          <span className="w-28" />
        </div>
      )}

      <div className="mt-1 flex flex-col divide-y divide-slate-100">
        {items.map((income) => (
          <IncomeItem
            key={income._id}
            income={income}
            displayAmount={income.monthlyAmount ?? income.convertedAmount ?? income.amount}
            displayCurrency={displayCurrency === "ALL" ? income.currency || "EGP" : displayCurrency}
            onEdit={onEdit}
            onDeleted={onDeleted}
            onToggled={onToggled}
          />
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 emerald:block emerald:pt-5">
        <h3 className="font-bold text-slate-700 emerald:text-sm">
          {t(displayCurrency === "ALL" ? "income.totalByCurrencyLabel" : "income.totalConvertedLabel")}
        </h3>
        <div className="flex flex-wrap justify-end gap-x-4 gap-y-2 emerald:mt-3 emerald:grid emerald:grid-cols-1 emerald:gap-3 emerald:min-[420px]:grid-cols-2 emerald:lg:grid-cols-4">
          {displayCurrency === "ALL"
            ? Object.entries(totalsByCurrency || calculatedTotal).map(([currency, total]) => (
              <CurrencyTotal key={currency} currency={currency} total={total} />
            ))
            : (
              <CurrencyTotal
                large
                currency={displayCurrency}
                total={totalAmount ?? Object.values(calculatedTotal).reduce((sum, total) => sum + total, 0)}
              />
            )}
          {displayCurrency === "ALL" && Object.keys(totalsByCurrency || calculatedTotal).length === 0 && (
            <CurrencyTotal currency="EGP" total={0} inlineOptions={{}} />
          )}
        </div>
      </div>
    </section>
  );
}

export default IncomeList;
