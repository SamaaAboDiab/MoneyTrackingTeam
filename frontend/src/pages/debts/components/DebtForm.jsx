import { useTranslation } from "react-i18next";
import { inputClass, labelClass } from "../constants";
import { CATEGORY_KEYS, CURRENCY_KEYS } from "../constants";

function DebtForm({ showAddForm, setShowAddForm, debtForm, handleDebtFormChange, handleCreateDebt, savingDebt }) {
  const { t } = useTranslation();

  const categoryLabel = (category) => t(`debts.category.${category || "other"}`);

  return (
    <>
    {showAddForm && (
      <form
        onSubmit={handleCreateDebt}
        className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80"
      >
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-lg font-bold text-slate-900">{t("debts.form.title")}</h2>
          <span className="text-xs text-slate-400">{t("debts.form.requiredNote")}</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>
              {t("debts.form.creditorLabel")} <span className="text-red-500">*</span>
            </label>
            <input
              required
              name="creditor"
              placeholder={t("debts.form.creditorPlaceholder")}
              value={debtForm.creditor}
              onChange={handleDebtFormChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              {t("debts.form.totalAmountLabel")} <span className="text-red-500">*</span>
            </label>
            <input
              required
              min="0.01"
              step="0.01"
              type="number"
              name="totalAmount"
              placeholder="0.00"
              value={debtForm.totalAmount}
              onChange={handleDebtFormChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              {t("debts.form.currencyLabel")} <span className="text-red-500">*</span>
            </label>
            <select
              required
              name="currency"
              value={debtForm.currency}
              onChange={handleDebtFormChange}
              className={inputClass}
            >
              {CURRENCY_KEYS.map((code) => (
                <option key={code} value={code}>{t(`debts.currencyOptions.${code}`)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>
              {t("debts.form.categoryLabel")}
            </label>
            <select
              name="category"
              value={debtForm.category}
              onChange={handleDebtFormChange}
              className={inputClass}
            >
              {CATEGORY_KEYS.map((key) => (
                <option key={key} value={key}>{categoryLabel(key)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>
              {t("debts.form.startDateLabel")} <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="date"
              name="startDate"
              value={debtForm.startDate}
              onChange={handleDebtFormChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              {t("debts.form.dueDateLabel")} <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="date"
              name="dueDate"
              value={debtForm.dueDate}
              onChange={handleDebtFormChange}
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>{t("debts.form.notesLabel")}</label>
            <textarea
              name="description"
              rows={2}
              placeholder={t("debts.form.notesPlaceholder")}
              value={debtForm.description}
              onChange={handleDebtFormChange}
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setShowAddForm(false)}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            {t("debts.cancel")}
          </button>
          <button
            type="submit"
            disabled={savingDebt}
            className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
          >
            {savingDebt ? t("debts.form.saving") : t("debts.form.save")}
          </button>
        </div>
      </form>
    )}
    </>
  );
}

export default DebtForm;
