import { useTranslation } from "react-i18next";
import { Plus, Trash2, CheckCircle2, AlertCircle, Clock, History, ChevronDown, ChevronUp, Wallet, Calendar, Check, Pencil, ReceiptText } from "lucide-react";
import { inputClass, labelClass } from "../constants";
import { formatMoney, formatDate as formatLocalDate, formatPercent } from "../../../utils/formatAmount";
import { isOverdue, isDueSoon, getDaysUntilDue } from "../utils";
import DatePicker from "../../../components/common/DatePicker";
import { ListSkeleton } from "../../../components/common/Skeleton";

function DebtCard({ debt, expandedHistoryDebtId, paymentHistory, loadingHistoryDebtId, activeAccounts, editingDueDateId, setEditingDueDateId, editingDueDate, setEditingDueDate, savingDueDate, handleUpdateDueDate, openPaymentModal, handleMarkPaid, handleDeleteDebt, toggleHistory }) {
  const { t } = useTranslation();

  function formatDate(dateString) {
    return formatLocalDate(dateString, { year: "numeric", month: "short", day: "numeric" }) || "—";
  }

  function getDueSoonMessage(dateString) {
    const daysUntilDue = getDaysUntilDue(dateString);
    if (daysUntilDue === 0) return t("debts.dueSoonMessage.today");
    if (daysUntilDue === 1) return t("debts.dueSoonMessage.tomorrow");
    return t("debts.dueSoonMessage.inDays", { count: daysUntilDue });
  }

  const categoryLabel = (category) => t(`debts.category.${category || "other"}`);

        const isPaid =
          debt.status === "paid" ||
          (debt.remainingAmount !== undefined && debt.remainingAmount <= 0) ||
          (debt.paidAmount !== undefined && debt.paidAmount >= debt.totalAmount);
        const remaining = isPaid
          ? 0
          : Number(debt.remainingAmount ?? debt.totalAmount - (debt.paidAmount || 0));
        const progress = isPaid
          ? 100
          : Math.min(
              100,
              Math.max(
                0,
                Number(
                  debt.progressPct ??
                    (debt.totalAmount > 0
                      ? ((debt.paidAmount || 0) / debt.totalAmount) * 100
                      : 0)
                )
              )
            );
        const overdue = isOverdue(debt);
        const dueSoon = isDueSoon(debt);
        const isExpanded = expandedHistoryDebtId === debt._id;
        const history = paymentHistory[debt._id] || [];

  // Colors per state: a thin accent bar, the ring and the amount follow it.
  const tone = isPaid
    ? { bar: "bg-emerald-500", ring: "#10b981", text: "text-emerald-600", pill: "bg-emerald-50 text-emerald-700", tile: "bg-emerald-50 text-emerald-600" }
    : overdue
    ? { bar: "bg-red-500", ring: "#ef4444", text: "text-red-600", pill: "bg-red-50 text-red-700", tile: "bg-red-50 text-red-600" }
    : dueSoon
    ? { bar: "bg-orange-400", ring: "#fb923c", text: "text-orange-600", pill: "bg-orange-50 text-orange-700", tile: "bg-orange-50 text-orange-600" }
    : { bar: "bg-brand-500", ring: "var(--color-brand-500, #10b981)", text: "text-slate-900", pill: "bg-amber-50 text-amber-700", tile: "bg-slate-100 text-slate-600" };
  const RING = 2 * Math.PI * 22;

  return (
    <article
      className={`relative flex h-full flex-col overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:shadow-md ${
        overdue ? "border-red-200" : "border-slate-200/80"
      }`}
    >
      <span aria-hidden="true" className={`absolute inset-y-0 w-1.5 inset-s-0 ${tone.bar}`} />

      <div className="flex flex-1 flex-col p-5 ps-6">
        {/* Header: who, what for, status */}
        <button type="button" onClick={() => toggleHistory(debt._id)} className="flex w-full items-start gap-3 text-start">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tone.tile}`}>
            {isPaid ? <CheckCircle2 size={20} /> : overdue ? <AlertCircle size={20} /> : <ReceiptText size={20} />}
          </span>
          <span className="min-w-0 flex-1">
            <span className={`block truncate text-base font-bold ${isPaid ? "text-slate-400 line-through" : "text-slate-900"}`}>
              {debt.creditor}
            </span>
            <span className="mt-0.5 block truncate text-xs text-slate-500">
              {categoryLabel(debt.category)}
              {debt.description ? ` · ${debt.description}` : ""}
            </span>
          </span>
          <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${tone.pill}`}>
            {isPaid ? <CheckCircle2 size={12} /> : overdue ? <AlertCircle size={12} /> : <Clock size={12} />}
            {isPaid
              ? t("debts.status.paid")
              : overdue
              ? t("debts.status.overdue")
              : dueSoon
              ? t("debts.status.dueSoon")
              : t("debts.status.active")}
          </span>
        </button>

        {/* Remaining amount + progress ring */}
        <div className="mt-5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500">{t("debts.amounts.remaining")}</p>
            <p className={`tabular-amount mt-1 break-words text-2xl font-extrabold leading-tight tracking-tight ${tone.text}`}>
              {formatMoney(remaining, debt.currency)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {t("debts.amounts.original")}:{" "}
              <span className={`font-semibold ${isPaid ? "line-through" : "text-slate-700"}`}>{formatMoney(debt.totalAmount, debt.currency)}</span>
            </p>
          </div>
          <div className="relative h-16 w-16 shrink-0" role="img" aria-label={`${t("debts.progressLabel")}: ${formatPercent(progress)}`}>
            <svg viewBox="0 0 52 52" className="h-full w-full -rotate-90">
              <circle cx="26" cy="26" r="22" fill="none" stroke="#f1f5f9" strokeWidth="5" />
              <circle
                cx="26"
                cy="26"
                r="22"
                fill="none"
                stroke={tone.ring}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={RING}
                strokeDashoffset={RING * (1 - progress / 100)}
                className="transition-[stroke-dashoffset] duration-700"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-slate-800">
              {isPaid ? <Check size={18} className="text-emerald-600" strokeWidth={3} /> : formatPercent(progress)}
            </span>
          </div>
        </div>

        {/* Paid so far + dates */}
        <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-2xl bg-emerald-50/70 px-3 py-2.5">
            <dt className="text-emerald-700/80">{t("debts.amounts.paid")}</dt>
            <dd className="mt-0.5 truncate text-sm font-bold text-emerald-700">
              {formatMoney(debt.paidAmount || (isPaid ? debt.totalAmount : 0), debt.currency)}
            </dd>
          </div>
          <div className={`rounded-2xl px-3 py-2.5 ${overdue ? "bg-red-50" : "bg-slate-50"}`}>
            <dt className={`flex items-center justify-between gap-1 ${overdue ? "text-red-600" : "text-slate-500"}`}>
              <span className="inline-flex items-center gap-1">
                <Calendar size={12} />
                {t("debts.dueDatePrefix")}
              </span>
              {!isPaid && editingDueDateId !== debt._id && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingDueDateId(debt._id);
                    setEditingDueDate(debt.dueDate ? new Date(debt.dueDate).toISOString().split("T")[0] : "");
                  }}
                  aria-label={t("debts.editDueDate")}
                  title={t("debts.editDueDate")}
                  className="rounded-md p-0.5 text-slate-400 transition hover:bg-white hover:text-brand-600"
                >
                  <Pencil size={12} />
                </button>
              )}
            </dt>
            <dd className={`mt-0.5 truncate text-sm font-bold ${overdue ? "text-red-700" : "text-slate-800"}`}>{formatDate(debt.dueDate)}</dd>
          </div>
        </dl>
        <p className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
          <Calendar size={11} />
          {t("debts.startDatePrefix")} {formatDate(debt.startDate)}
        </p>

        {dueSoon && !isPaid && (
          <p className="mt-3 flex items-center gap-1.5 rounded-xl bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700">
            <AlertCircle size={14} />
            {getDueSoonMessage(debt.dueDate)}
          </p>
        )}

                {editingDueDateId === debt._id && (
                  <div className="mt-3 rounded-xl bg-slate-50 p-3">
                    <form onSubmit={(event) => handleUpdateDueDate(debt, event)} className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-end">
                      <div className="min-w-0 sm:min-w-[13rem]">
                        <label htmlFor={`due-date-${debt._id}`} className={labelClass}>{t("debts.editDueDate")}</label>
                        <DatePicker
                          id={`due-date-${debt._id}`}
                          required
                          value={editingDueDate}
                          onChange={setEditingDueDate}
                          className={inputClass}
                        />
                      </div>
                      <button type="submit" disabled={savingDueDate} className="min-h-11 rounded-xl bg-brand-600 px-3.5 py-2.5 text-xs font-semibold text-white disabled:opacity-60">
                        {savingDueDate ? t("debts.form.saving") : t("debts.saveDate")}
                      </button>
                      <button type="button" onClick={() => setEditingDueDateId(null)} className="min-h-11 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-600">
                        {t("debts.cancel")}
                      </button>
                    </form>
                  </div>
                )}

                {/* Actions — pinned to the card's bottom so cards side by side line up */}
                <div aria-hidden="true" className="h-4 shrink-0" />
                <div className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-4">
                  {!isPaid && (
                    <button
                      type="button"
                      onClick={(e) => openPaymentModal(debt, e)}
                      className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-3 text-xs font-bold text-white shadow-sm transition hover:bg-brand-700 sm:text-sm"
                    >
                      <Plus size={16} className="shrink-0" />
                      <span className="truncate">{t("debts.actions.addPayment")}</span>
                    </button>
                  )}
                  {!isPaid && (
                    <button
                      type="button"
                      onClick={(e) => handleMarkPaid(debt, e)}
                      className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-50 px-3 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 sm:text-sm"
                    >
                      <CheckCircle2 size={16} className="shrink-0" />
                      <span className="truncate">{t("debts.actions.markPaid")}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleHistory(debt._id)}
                    aria-expanded={isExpanded}
                    title={isExpanded ? t("debts.actions.hideHistory") : t("debts.actions.showHistory")}
                    className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-bold transition sm:text-sm ${
                      isExpanded ? "bg-slate-200 text-slate-800" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    } ${isPaid ? "flex-1" : ""}`}
                  >
                    <History size={16} className="shrink-0" />
                    <span className={isPaid ? "" : "sr-only"}>
                      {isExpanded ? t("debts.actions.hideHistory") : t("debts.actions.showHistory")}
                    </span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteDebt(debt._id, e)}
                    aria-label={t("debts.actions.delete")}
                    title={t("debts.actions.delete")}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* US-503: Payment History Section */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/60 p-4 ps-6">
                  {!isPaid && (
                    <div className="mb-4 rounded-xl bg-brand-50 px-3.5 py-3 text-sm text-brand-800">
                      {debt.paymentForecast?.status === "available" ? (
                        <>
                          <p className="font-semibold">
                            {t("debts.forecast.payoffBy", {
                              date: formatLocalDate(debt.paymentForecast.estimatedPayoffDate, { year: "numeric", month: "long" }),
                            })}
                          </p>
                          <p className="mt-1 text-xs text-brand-700">
                            {t("debts.forecast.averageMonthly", {
                              amount: formatMoney(debt.paymentForecast.averageMonthlyPayment, debt.currency),
                            })}
                          </p>
                        </>
                      ) : (
                        <p className="font-semibold">{t("debts.forecast.notEnoughData")}</p>
                      )}
                    </div>
                  )}
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                      <History size={16} className="text-brand-600" />
                      {t("debts.history.title", { count: history.length })}
                    </h3>
                    {!isPaid && (
                      <button
                        type="button"
                        onClick={(e) => openPaymentModal(debt, e)}
                        className="text-xs font-semibold text-brand-600 hover:underline"
                      >
                        {t("debts.history.addNew")}
                      </button>
                    )}
                  </div>

                  {loadingHistoryDebtId === debt._id ? (
                    <ListSkeleton rows={2} className="rounded-xl bg-white px-3" label={t("debts.history.loading")} />
                  ) : history.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
                      {t("debts.history.empty")}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {history.map((payment) => (
                        <div
                          key={payment._id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-3 text-sm shadow-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                              <Check size={16} />
                            </span>
                            <div>
                              <p className="font-bold text-slate-900">
                                {formatMoney(payment.amount, debt.currency)}
                              </p>
                              <p className="text-xs text-slate-500">
                                {formatDate(payment.date)}
                                {payment.notes ? ` • ${payment.notes}` : ""}
                              </p>
                            </div>
                          </div>

                          {payment.accountId && (
                            <div className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                              <Wallet size={13} className="text-slate-400" />
                              <span>
                                {typeof payment.accountId === "object"
                                  ? payment.accountId.name
                                  : activeAccounts.find((a) => a._id === payment.accountId)
                                      ?.name || t("debts.history.unknownAccount")}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
    </article>
  );
}

export default DebtCard;
