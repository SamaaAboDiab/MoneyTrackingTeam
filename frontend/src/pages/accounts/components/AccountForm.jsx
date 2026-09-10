const inputClass =
  "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500";
const labelClass = "text-sm font-semibold text-slate-700";
const errorClass = "rounded-xl bg-expense-soft px-4 py-2.5 text-sm font-medium text-expense";

function AccountForm({ form, createStatus, createError, onChange, onSubmit, t }) {
  return (
    <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100">
      <h2 className="text-lg font-bold text-slate-900">{t("accounts.submit")}</h2>

      <form onSubmit={onSubmit} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className={labelClass}>
            {t("accounts.nameLabel")}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={onChange}
            placeholder={t("accounts.namePlaceholder")}
            required
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="type" className={labelClass}>
            {t("accounts.typeLabel")}
          </label>
          <select id="type" name="type" value={form.type} onChange={onChange} required className={inputClass}>
            <option value="">{t("accounts.typePlaceholder")}</option>
            <option value="bank">{t("accounts.bank")}</option>
            <option value="wallet">{t("accounts.wallet")}</option>
            <option value="cash">{t("accounts.cash")}</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="initialBalance" className={labelClass}>
            {t("accounts.balanceLabel")}
          </label>
          <input
            id="initialBalance"
            name="initialBalance"
            type="number"
            step="0.01"
            value={form.initialBalance}
            onChange={onChange}
            placeholder="0"
            required
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="currency" className={labelClass}>
            {t("accounts.currencyLabel")}
          </label>
          <select id="currency" name="currency" value={form.currency} onChange={onChange} required className={inputClass}>
            <option value="EGP">EGP</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="color" className={labelClass}>
            {t("accounts.colorLabel")}
          </label>
          <input
            id="color"
            name="color"
            type="color"
            value={form.color}
            onChange={onChange}
            className="h-11 w-16 cursor-pointer rounded-lg border border-slate-200 p-1"
          />
        </div>

        <div className="flex flex-col justify-end gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
          {createError && <p className={errorClass}>{createError}</p>}
          <button
            type="submit"
            disabled={createStatus === "loading"}
            className="ms-auto rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-65"
          >
            {createStatus === "loading" ? t("accounts.submitting") : t("accounts.submit")}
          </button>
        </div>
      </form>
    </section>
  );
}

export default AccountForm;
