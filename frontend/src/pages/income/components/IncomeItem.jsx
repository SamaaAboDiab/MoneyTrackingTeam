import { useTranslation } from "react-i18next";

function IncomeItem({ income, onEdit }) {
  const { t, i18n } = useTranslation();
  const date = new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" }).format(
    new Date(income.receivedDate)
  );
  const amount = Number(income.amount).toLocaleString(i18n.language, {
    maximumFractionDigits: 2,
  });

  return (
    <article className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-slate-900">{income.name}</h3>
        <p className="text-sm text-slate-500">
          {t(`income.categories.${income.category}`)} · {date}
        </p>
        {income.notes && <small className="text-xs text-slate-400">{income.notes}</small>}
      </div>
      <strong className="tabular-amount shrink-0 text-lg font-bold text-income">
        {amount} {income.currency}
      </strong>
      {onEdit && (
        <button
          type="button"
          onClick={() => onEdit(income)}
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          تعديل
        </button>
      )}
    </article>
  );
}

export default IncomeItem;
