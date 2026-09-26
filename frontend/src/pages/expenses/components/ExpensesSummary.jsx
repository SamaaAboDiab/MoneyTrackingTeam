import { useTranslation } from "react-i18next";
import { formatAmount } from "../../../utils/formatAmount";

function ExpensesSummary({ isFiltered, totalExpenses }) {
  const { t } = useTranslation();

  return (
    <>
    <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100">
      <p className="text-sm font-medium text-slate-500">
        {t("expenses.totalLabel")} {isFiltered && t("expenses.totalFilteredSuffix")}
      </p>
      <div className="mt-1 flex items-baseline gap-2">
        <strong className="tabular-amount text-3xl font-extrabold text-slate-900">
          {formatAmount(totalExpenses)}
        </strong>
        <span className="text-sm font-medium text-slate-500">EGP</span>
      </div>
    </section>
    </>
  );
}

export default ExpensesSummary;
