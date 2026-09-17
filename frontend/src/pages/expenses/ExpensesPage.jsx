import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  createExpenseEntry,
  fetchExpenses,
  resetExpenseCreateStatus,
  fetchCategories,
} from "../../store/slices/expensesSlice";
import { fetchAccounts } from "../../store/slices/accountsSlice";

const EMPTY_FORM = {
  description: "",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  paymentMethod: "cash",
  expenseType: "",
  category: "",
  accountId: "",
  notes: "",
};

const TYPE_PILL_STYLES = {
  daily: "bg-red-100 text-red-700",
  weekly: "bg-orange-100 text-orange-700",
  monthly: "bg-blue-100 text-blue-700",
  yearly: "bg-purple-100 text-purple-700",
  fixed: "bg-yellow-100 text-yellow-700",
  emergency: "bg-slate-200 text-slate-700",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500";
const labelClass = "text-sm font-semibold text-slate-700";

function ExpensesPage() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { items, status, error, createStatus, createError } = useSelector((state) => state.expenses);
  const categories = useSelector((state) => state.expenses.categories.items);
  const accounts = useSelector((state) => state.accounts.items);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    dispatch(fetchExpenses());
    dispatch(fetchAccounts());
    dispatch(fetchCategories());
    return () => dispatch(resetExpenseCreateStatus());
  }, [dispatch]);

  const formatMoney = (value) =>
    new Intl.NumberFormat(i18n.language, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value || 0));

  const totalExpenses = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [items]
  );

  const handleChange = ({ target }) => {
    const { name, value } = target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.expenseType || !form.category) {
      return;
    }

    const result = await dispatch(createExpenseEntry({
      description: form.description.trim(),
      amount: Number(form.amount),
      date: form.date,
      paymentMethod: form.paymentMethod,
      expenseType: form.expenseType,
      category: form.category,
      accountId: form.accountId || undefined,
      notes: form.notes.trim(),
      currency: "EGP",
      status: "confirmed",
    }));

    if (createExpenseEntry.fulfilled.match(result)) {
      setForm({ ...EMPTY_FORM, date: new Date().toISOString().slice(0, 10) });
      if (form.accountId) {
        dispatch(fetchAccounts());
      }
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{t("expenses.title")}</h1>
          <p className="mt-1 text-slate-500">{t("expenses.description")}</p>
        </div>

        <Link to="/dashboard" className="font-semibold text-brand-700 hover:underline">
          {t("common.backToDashboard")}
        </Link>
      </div>

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100">
        <p className="text-sm font-medium text-slate-500">{t("expenses.totalLabel")}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <strong className="tabular-amount text-3xl font-extrabold text-slate-900">
            {formatMoney(totalExpenses)}
          </strong>
          <span className="text-sm font-medium text-slate-500">EGP</span>
        </div>
      </section>

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100">
        <h2 className="text-lg font-bold text-slate-900">{t("expenses.formTitle")}</h2>

        <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="description" className={labelClass}>{t("expenses.descriptionLabel")}</label>
            <input
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder={t("expenses.descriptionPlaceholder")}
              required
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="amount" className={labelClass}>{t("expenses.amountLabel")}</label>
            <input
              id="amount"
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="date" className={labelClass}>{t("expenses.dateLabel")}</label>
            <input
              id="date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="paymentMethod" className={labelClass}>{t("expenses.paymentMethodLabel")}</label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="cash">{t("expenses.paymentMethod.cash")}</option>
              <option value="card">{t("expenses.paymentMethod.card")}</option>
              <option value="wallet">{t("expenses.paymentMethod.wallet")}</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="expenseType" className={labelClass}>{t("expenses.expenseTypeLabel")}</label>
            <select
              id="expenseType"
              name="expenseType"
              value={form.expenseType}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="">{t("expenses.expenseTypePlaceholder")}</option>
              <option value="daily">{t("expenses.expenseType.daily")}</option>
              <option value="fixed">{t("expenses.expenseType.fixed")}</option>
              <option value="emergency">{t("expenses.expenseType.emergency")}</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="category" className={labelClass}>{t("expenses.categoryLabel")}</label>
              <Link to="/categories" className="text-xs font-semibold text-brand-700 hover:underline">
                {t("expenses.manageCategories")}
              </Link>
            </div>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="">{t("expenses.categoryPlaceholder")}</option>
              {categories.map((category) => (
                <option key={category._id} value={category.name}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="accountId" className={labelClass}>{t("expenses.accountLabel")}</label>
            <select
              id="accountId"
              name="accountId"
              value={form.accountId}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">{t("expenses.noAccountOption")}</option>
              {accounts.map((account) => (
                <option key={account._id} value={account._id}>
                  {account.name} ({formatMoney(account.balance)} {account.currency})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="notes" className={labelClass}>{t("expenses.notesLabel")}</label>
            <textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
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
              <p className="rounded-xl bg-income-soft px-4 py-2.5 text-sm font-medium text-income">
                {t("expenses.success")}
              </p>
            )}
            <button
              type="submit"
              disabled={createStatus === "loading"}
              className="ms-auto rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-65"
            >
              {createStatus === "loading" ? t("expenses.submitting") : t("expenses.submit")}
            </button>
          </div>
        </form>
      </section>

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100">
        <h3 className="text-lg font-bold text-slate-900">{t("expenses.listTitle")}</h3>

        {error && (
          <p className="mt-4 rounded-xl bg-expense-soft px-4 py-2.5 text-sm font-medium text-expense">
            {error}
          </p>
        )}

        {status === "loading" ? (
          <p className="mt-4 text-slate-500">{t("expenses.loading")}</p>
        ) : items.length === 0 ? (
          <p className="mt-4 text-slate-500">{t("expenses.empty")}</p>
        ) : (
          <div className="mt-4 flex flex-col divide-y divide-slate-100">
            {items.map((expense) => {
              const pillClass = TYPE_PILL_STYLES[expense.expenseType] || TYPE_PILL_STYLES.fixed;
              return (
                <div key={expense._id} className="grid grid-cols-1 gap-3 py-4 sm:grid-cols-5">
                  <div>
                    <span className="block text-xs font-medium text-slate-500">{t("expenses.fields.description")}</span>
                    <strong className="text-slate-900">{expense.description}</strong>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-slate-500">{t("expenses.fields.category")}</span>
                    <span className="text-sm text-slate-700">{expense.category}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-slate-500">{t("expenses.fields.type")}</span>
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${pillClass}`}>
                      {t(`expenses.expenseType.${expense.expenseType}`, expense.expenseType)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-slate-500">{t("expenses.fields.amount")}</span>
                    <span className="tabular-amount text-sm font-bold text-expense">
                      {formatMoney(expense.amount)} {expense.currency || "EGP"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-slate-500">{t("expenses.fields.date")}</span>
                    <span className="text-sm text-slate-700">
                      {new Date(expense.date).toLocaleDateString(i18n.language)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default ExpensesPage;
