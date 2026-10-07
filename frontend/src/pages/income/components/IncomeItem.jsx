import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { toggleIncomeRecurrence } from "../../../store/slices/incomeSlice";
import DeleteIncomeButton from "./DeleteIncomeButton";
import { formatMoney, formatDate } from "../../../utils/formatAmount";

function IncomeItem({ income, displayAmount, displayCurrency, amountLabel, onEdit, onDeleted, onToggled }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isRecurring = income.recurrence && income.recurrence !== "once";
  const isPaused = isRecurring && income.isActive === false;

  const date = formatDate(income.receivedDate, { dateStyle: "medium" });
  const currency = displayCurrency || income.currency;
  const amount = formatMoney(displayAmount ?? income.amount, currency);
  const originalAmount = formatMoney(income.amount || 0, income.currency);

  return (
    <article className="grid grid-cols-2 gap-4 py-5 md:grid-cols-[minmax(10rem,1.4fr)_minmax(7rem,1fr)_minmax(10rem,1fr)_minmax(8rem,1fr)_auto] md:items-center">
      {/* اسم المصدر */}
      <div className="min-w-0">
        <span className="text-xs font-semibold text-slate-400">
          {t("income.fields.name")}
        </span>

        <h3 className="mt-1 truncate font-semibold text-slate-900">
          {income.name}
        </h3>

        {isRecurring && (
          <span
            className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
              isPaused ? "bg-slate-200 text-slate-600" : "bg-brand-50 text-brand-700"
            }`}
          >
            {isPaused ? t("income.pausedBadge") : t("income.recurringBadge")} · {t(`income.recurrence.${income.recurrence}`)}
          </span>
        )}

        {income.notes && (
          <small className="text-xs text-slate-400">
            {income.notes}
          </small>
        )}
      </div>

      {/* الفئة */}
      <div>
        <span className="text-xs font-semibold text-slate-400">
          {t("income.fields.category")}
        </span>

        <p className="mt-1 font-semibold text-slate-700">
          {t(`income.categories.${income.category}`)}
        </p>
      </div>

      {/* المبلغ */}
      <div className="flex flex-col items-start">
        <span className="text-xs font-semibold text-slate-400">
          {t(amountLabel)}
        </span>

        <strong className="mt-1 block tabular-amount text-lg font-bold text-income">
          {amount}
        </strong>

        <small className="mt-1 block text-xs text-slate-400">
          {t("income.fields.originalPrefix")} {originalAmount}
        </small>
      </div>

      {/* التاريخ */}
      <div>
        <span className="text-xs font-semibold text-slate-400">
          {t("income.fields.date")}
        </span>

        <p className="mt-1 font-semibold text-slate-700">
          {date}
        </p>
      </div>

      {/* الأزرار */}
      <div className="col-span-2 flex items-center justify-end gap-2 md:col-span-1">
        {isRecurring && (
          <button
            type="button"
            onClick={async () => {
              await dispatch(toggleIncomeRecurrence(income._id));
              onToggled?.();
            }}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
          >
            {isPaused ? t("income.resume") : t("income.pause")}
          </button>
        )}

        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(income)}
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-brand-700"
          >
            {t("common.edit")}
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