import { useTranslation } from "react-i18next";
import DeleteIncomeButton from "./DeleteIncomeButton";

function IncomeItem({ income, displayAmount, displayCurrency, onEdit, onDeleted }) {
  const { t, i18n } = useTranslation();

  const date = new Intl.DateTimeFormat(i18n.language, {
    dateStyle: "medium",
  }).format(new Date(income.receivedDate));

  const amount = Number(displayAmount ?? income.amount).toLocaleString(
    i18n.language,
    {
      maximumFractionDigits: 2,
    }
  );

  const originalAmount = Number(income.amount || 0).toLocaleString(
    i18n.language,
    {
      maximumFractionDigits: 2,
    }
  );

  const currency = displayCurrency || income.currency;

  return (
    <article className="grid grid-cols-2 gap-4 py-5 md:grid-cols-[minmax(10rem,1.4fr)_minmax(7rem,1fr)_minmax(10rem,1fr)_minmax(8rem,1fr)_auto] md:items-center">
      {/* اسم المصدر */}
      <div className="min-w-0">
        <span className="text-xs font-semibold text-slate-400">
          اسم المصدر
        </span>

        <h3 className="mt-1 truncate font-semibold text-slate-900">
          {income.name}
        </h3>

        {income.notes && (
          <small className="text-xs text-slate-400">
            {income.notes}
          </small>
        )}
      </div>

      {/* الفئة */}
      <div>
        <span className="text-xs font-semibold text-slate-400">
          الفئة
        </span>

        <p className="mt-1 font-semibold text-slate-700">
          {t(`income.categories.${income.category}`)}
        </p>
      </div>

      {/* المبلغ */}
      <div className="flex flex-col items-start">
        <span className="text-xs font-semibold text-slate-400">
          المبلغ بالعملة المختارة
        </span>

        <strong className="mt-1 block tabular-amount text-lg font-bold text-income">
          {amount} {currency}
        </strong>

        <small className="mt-1 block text-xs text-slate-400">
          الأصل: {originalAmount} {income.currency}
        </small>
      </div>

      {/* التاريخ */}
      <div>
        <span className="text-xs font-semibold text-slate-400">
          التاريخ
        </span>

        <p className="mt-1 font-semibold text-slate-700">
          {date}
        </p>
      </div>

      {/* الأزرار */}
      <div className="col-span-2 flex items-center justify-end gap-2 md:col-span-1">
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(income)}
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            تعديل
          </button>
        )}

        {onDeleted && (
          <DeleteIncomeButton
            incomeId={income._id}
            incomeName={income.name}
            onConfirmDelete={onDeleted}
          />
        )}
      </div>
    </article>
  );
}

export default IncomeItem;