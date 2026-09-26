import { useTranslation } from "react-i18next";

const inputClass =
  "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500";
const labelClass = "text-sm font-semibold text-slate-700";

function IncomeForm({ form, createStatus, createError, onChange, onSubmit, t }) {
  const { i18n } = useTranslation();

  return (
    <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100">
      <h2 className="text-lg font-bold text-slate-900">{t("income.formTitle")}</h2>

      <form onSubmit={onSubmit} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="income-name" className={labelClass}>
            {t("income.nameLabel")}
          </label>
          <input
            id="income-name"
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder={t("income.namePlaceholder")}
            maxLength={100}
            required
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="income-category" className={labelClass}>
            {t("income.categoryLabel")}
          </label>
          <select
            id="income-category"
            name="category"
            value={form.category}
            onChange={onChange}
            required
            className={inputClass}
          >
            <option value="">{t("income.categoryPlaceholder")}</option>
            {["salary", "freelance", "rental", "investment", "other"].map((category) => (
              <option key={category} value={category}>
                {t(`income.categories.${category}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="income-amount" className={labelClass}>
            {t("income.amountLabel")}
          </label>
          <input
            id="income-amount"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={onChange}
            placeholder="0.00"
            required
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="income-currency" className={labelClass}>
            {t("income.currencyLabel")}
          </label>
          <select
            id="income-currency"
            name="currency"
            value={form.currency}
            onChange={onChange}
            required
            className={inputClass}
          >
            <option value="EGP">EGP</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="income-date" className={labelClass}>
            {t("income.receivedDateLabel")}
          </label>
          <input
            id="income-date"
            name="receivedDate"
            type="date"
            value={form.receivedDate}
            onChange={onChange}
            required
            className={`${inputClass} font-medium text-slate-800`}
          />
          {form.receivedDate && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 pr-1">
              <svg className="h-3.5 w-3.5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clipRule="evenodd" />
              </svg>
              {new Date(form.receivedDate).toLocaleDateString(i18n.language, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="income-recurrence" className={labelClass}>
            {t("income.recurrenceLabel")}
          </label>
          <select
            id="income-recurrence"
            name="recurrence"
            value={form.recurrence || "once"}
            onChange={onChange}
            required
            className={inputClass}
          >
            {["once", "weekly", "monthly", "yearly"].map((key) => (
              <option key={key} value={key}>
                {t(`income.recurrence.${key}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="income-notes" className={labelClass}>
            {t("income.notesLabel")}
          </label>
          <textarea
            id="income-notes"
            name="notes"
            value={form.notes}
            onChange={onChange}
            placeholder={t("income.notesPlaceholder")}
            maxLength={500}
            rows="3"
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="flex flex-col justify-end gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
          {createError && (
            <p className="rounded-xl bg-expense-soft px-4 py-2.5 text-sm font-medium text-expense">
              {createError}
            </p>
          )}
          {createStatus === "succeeded" && (
            <p role="status" className="rounded-xl bg-income-soft px-4 py-2.5 text-sm font-medium text-income">
              {t("income.success")}
            </p>
          )}
          <button
            type="submit"
            disabled={createStatus === "loading"}
            className="ms-auto rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-65"
          >
            {createStatus === "loading" ? t("income.submitting") : t("income.submit")}
          </button>
        </div>
      </form>
    </section>
  );
}

export default IncomeForm;
