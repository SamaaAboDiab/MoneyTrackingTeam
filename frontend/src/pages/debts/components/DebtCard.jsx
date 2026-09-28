import { useTranslation } from "react-i18next";
import { Plus, Trash2, CheckCircle2, AlertCircle, Clock, History, ChevronDown, ChevronUp, Wallet, Calendar, Check } from "lucide-react";
import { inputClass, labelClass } from "../constants";
import { formatAmount } from "../../../utils/formatAmount";
import { isOverdue, isDueSoon, getDaysUntilDue } from "../utils";

function DebtCard({ debt, expandedHistoryDebtId, paymentHistory, loadingHistoryDebtId, activeAccounts, editingDueDateId, setEditingDueDateId, editingDueDate, setEditingDueDate, savingDueDate, handleUpdateDueDate, openPaymentModal, handleMarkPaid, handleDeleteDebt, toggleHistory }) {
  const { t, i18n } = useTranslation();

  function formatDate(dateString) {
    if (!dateString) return "—";
    try {
      const d = new Date(dateString);
      return Number.isNaN(d.getTime())
        ? dateString
        : d.toLocaleDateString(i18n.language, {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
    } catch {
      return dateString;
    }
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

  return (
    <>
            <article
              key={debt._id}
              className={`overflow-hidden rounded-2xl bg-white shadow-sm transition-all ${
                isPaid
                  ? "border border-emerald-200/80 bg-emerald-50/20 ring-1 ring-emerald-100"
                  : overdue
                  ? "border-2 border-red-500 ring-2 ring-red-100"
                  : "border border-slate-200/90 ring-1 ring-slate-100"
              }`}
            >
              {/* Overdue banner indicator */}
              {overdue && (
                <div className="flex items-center gap-1.5 bg-red-600 px-5 py-1.5 text-xs font-bold text-white">
                  <AlertCircle size={14} />
                  <span>{t("debts.overdueBanner")}</span>
                </div>
              )}

              <div className="p-5">
                {/* Card Header */}
                <div
                  className="flex cursor-pointer flex-wrap items-start justify-between gap-3"
                  onClick={() => toggleHistory(debt._id)}
                >
                  <div>
                    <div className="flex items-center gap-2.5">
                      {/* US-506: Completed debts have strikethrough and green checkmark icon */}
                      {isPaid && (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                          <Check size={16} strokeWidth={3} />
                        </span>
                      )}

                      <h2
                        className={`text-lg font-bold ${
                          isPaid
                            ? "text-slate-400 line-through"
                            : "text-slate-900"
                        }`}
                      >
                        {debt.creditor}
                      </h2>

                      {isPaid ? (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                          <CheckCircle2 size={13} /> {t("debts.status.paid")}
                        </span>
                      ) : overdue ? (
                        <span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
                          <AlertCircle size={12} /> {t("debts.status.overdue")}
                        </span>
                      ) : (
                        <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          dueSoon ? "bg-orange-100 text-orange-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          <Clock size={12} /> {dueSoon ? t("debts.status.dueSoon") : t("debts.status.active")}
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      {categoryLabel(debt.category)}
                      {debt.description ? ` • ${debt.description}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-xs text-slate-500">{t("debts.clickForHistory")}</span>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {/* US-503 & US-506: Amounts & Progress */}
                <div
                  onClick={() => toggleHistory(debt._id)}
                  className="mt-4 grid cursor-pointer grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3.5 text-center transition hover:bg-slate-100 sm:gap-4"
                >
                  <div>
                    <p className="text-xs text-slate-500">{t("debts.amounts.original")}</p>
                    <p
                      className={`mt-0.5 text-sm font-bold sm:text-base ${
                        isPaid ? "text-slate-400 line-through" : "text-slate-900"
                      }`}
                    >
                      {formatAmount(debt.totalAmount)} {debt.currency}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">{t("debts.amounts.paid")}</p>
                    <p className="mt-0.5 text-sm font-bold text-emerald-600 sm:text-base">
                      {formatAmount(debt.paidAmount || (isPaid ? debt.totalAmount : 0))} {debt.currency}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">{t("debts.amounts.remaining")}</p>
                    <p
                      className={`mt-0.5 text-sm font-bold sm:text-base ${
                        isPaid
                          ? "text-emerald-600"
                          : overdue
                          ? "text-red-600"
                          : "text-amber-600"
                      }`}
                    >
                      {formatAmount(remaining)} {debt.currency}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="mb-1.5 flex justify-between text-xs font-semibold text-slate-600">
                    <span>{t("debts.progressLabel")}</span>
                    <span className={isPaid ? "text-emerald-700 font-bold" : ""}>
                      {isPaid ? t("debts.progressComplete") : `${Math.round(progress)}%`}
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isPaid
                          ? "bg-emerald-500"
                          : overdue
                          ? "bg-red-500"
                          : "bg-brand-600"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* US-503: Dates Details */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-slate-400" />
                    <span>{t("debts.startDatePrefix")}</span>
                    <strong className="text-slate-700">{formatDate(debt.startDate)}</strong>
                  </div>

                  {dueSoon && (
                    <div className="flex items-center gap-1.5 font-bold text-orange-600">
                      <AlertCircle size={14} />
                      <span>{getDueSoonMessage(debt.dueDate)}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5">
                    <Calendar
                      size={14}
                      className={overdue ? "text-red-500" : "text-slate-400"}
                    />
                    <span>{t("debts.dueDatePrefix")}</span>
                    <strong className={overdue ? "font-bold text-red-600" : "text-slate-700"}>
                      {formatDate(debt.dueDate)}
                    </strong>
                  </div>
                </div>

                <div className="mt-3 border-t border-slate-100 pt-3">
                  {editingDueDateId === debt._id ? (
                    <form onSubmit={(event) => handleUpdateDueDate(debt, event)} className="flex flex-wrap items-end gap-2">
                      <div>
                        <label className={labelClass}>{t("debts.editDueDate")}</label>
                        <input
                          required
                          type="date"
                          value={editingDueDate}
                          onChange={(event) => setEditingDueDate(event.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <button type="submit" disabled={savingDueDate} className="rounded-xl bg-brand-600 px-3.5 py-2.5 text-xs font-semibold text-white disabled:opacity-60">
                        {savingDueDate ? t("debts.form.saving") : t("debts.saveDate")}
                      </button>
                      <button type="button" onClick={() => setEditingDueDateId(null)} className="rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-600">
                        {t("debts.cancel")}
                      </button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDueDateId(debt._id);
                        setEditingDueDate(debt.dueDate ? new Date(debt.dueDate).toISOString().split("T")[0] : "");
                      }}
                      className="text-xs font-semibold text-brand-600 hover:underline"
                    >
                      {t("debts.editDueDate")}
                    </button>
                  )}
                </div>

                {/* US-504: Payment-rate forecast */}
                {!isPaid && (
                  <div className="mt-3 rounded-xl bg-brand-50 px-3.5 py-3 text-sm text-brand-800">
                    {debt.paymentForecast?.status === "available" ? (
                      <>
                        <p className="font-semibold">{debt.paymentForecast.message}</p>
                        <p className="mt-1 text-xs text-brand-700">
                          {t("debts.forecast.averageMonthly", {
                            amount: `${formatAmount(debt.paymentForecast.averageMonthlyPayment)} ${debt.currency}`,
                          })}
                        </p>
                      </>
                    ) : (
                      <p className="font-semibold">{t("debts.forecast.notEnoughData")}</p>
                    )}
                  </div>
                )}

                {/* US-502 & US-506 Actions: زرار "تم السداد" على كل دين نشط */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                  <div className="flex flex-wrap gap-2">
                    {!isPaid && (
                      <button
                        type="button"
                        onClick={(e) => openPaymentModal(debt, e)}
                        className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700"
                      >
                        <Plus size={15} /> {t("debts.actions.addPayment")}
                      </button>
                    )}

                    {/* US-506: زرار "تم السداد" على كل دين نشط */}
                    {!isPaid && (
                      <button
                        type="button"
                        onClick={(e) => handleMarkPaid(debt, e)}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                      >
                        <CheckCircle2 size={15} /> {t("debts.actions.markPaid")}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleHistory(debt._id)}
                      className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                    >
                      <History size={15} />
                      {isExpanded ? t("debts.actions.hideHistory") : t("debts.actions.showHistory")}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteDebt(debt._id, e)}
                    className="flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                  >
                    <Trash2 size={14} /> {t("debts.actions.delete")}
                  </button>
                </div>
              </div>

              {/* US-503: Payment History Section */}
              {isExpanded && (
                <div className="border-t border-slate-200 bg-slate-50/70 p-5">
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
                    <p className="py-4 text-center text-xs font-medium text-slate-500">
                      {t("debts.history.loading")}
                    </p>
                  ) : history.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
                      {t("debts.history.empty")}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {history.map((payment) => (
                        <div
                          key={payment._id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                              <Check size={16} />
                            </span>
                            <div>
                              <p className="font-bold text-slate-900">
                                {formatAmount(payment.amount)} {debt.currency}
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
    </>
  );
}

export default DebtCard;
