import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, X, WalletCards } from "lucide-react";
import { useTranslation } from "react-i18next";
import CategorySelect from "../../pages/categories/components/CategorySelect";
import { createAccount, fetchAccounts } from "../../store/slices/accountsSlice";
import { createExpenseEntry, fetchExpenses } from "../../store/slices/expensesSlice";

function QuickAddButton() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { items: accounts = [] } = useSelector((state) => state.accounts);

  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accounts.length) {
      dispatch(fetchAccounts());
    }
  }, [accounts.length, dispatch]);

  const cashAccount = useMemo(
    () =>
      accounts.find(
        (account) => account.type === "cash" && !account.isArchived
      ) ||
      accounts.find((account) => account.type === "cash"),
    [accounts]
  );

  const ensureCashAccount = async () => {
    let activeCashAccount = cashAccount;

    if (!activeCashAccount) {
      const refreshed = await dispatch(fetchAccounts());
      const freshAccounts = refreshed.payload || [];
      activeCashAccount =
        freshAccounts.find(
          (account) => account.type === "cash" && !account.isArchived
        ) ||
        freshAccounts.find((account) => account.type === "cash");
    }

    if (activeCashAccount) return activeCashAccount;

    const created = await dispatch(
      createAccount({
        name: "الكاش",
        type: "cash",
        balance: 0,
        currency: "EGP",
        color: "#f59e0b",
      })
    );

    if (createAccount.fulfilled.match(created)) {
      await dispatch(fetchAccounts());
      return created.payload;
    }

    const fallback = await dispatch(fetchAccounts());
    const reloadedAccounts = fallback.payload || [];
    const existingCash =
      reloadedAccounts.find(
        (account) => account.type === "cash" && !account.isArchived
      ) ||
      reloadedAccounts.find((account) => account.type === "cash");

    if (existingCash) return existingCash;

    throw new Error(t("layout.quickAddNoCash"));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const parsedAmount = Number(amount);
    if (!amount || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError(t("layout.quickAddInvalidAmount"));
      return;
    }

    const selectedCategory = (category || "غيره").trim();

    try {
      setIsSubmitting(true);
      setError("");

      const account = await ensureCashAccount();
      const result = await dispatch(
        createExpenseEntry({
          amount: parsedAmount,
          description: description.trim() || selectedCategory,
          date: new Date().toISOString().slice(0, 10),
          paymentMethod: "cash",
          expenseType: "daily",
          category: selectedCategory,
          notes: description.trim(),
          currency: "EGP",
          status: "confirmed",
          accountId: account._id,
        })
      );

      if (createExpenseEntry.fulfilled.match(result)) {
        setAmount("");
        setCategory("");
        setDescription("");
        setIsOpen(false);
        dispatch(fetchAccounts());
        dispatch(fetchExpenses());
        return;
      }

      setError(result.payload || t("layout.quickAddError"));
    } catch (err) {
      setError(err.message || t("layout.quickAddError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-xl bg-brand-600 px-3.5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
      >
        <Plus size={16} />
        <span>{t("layout.quickAdd")}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <WalletCards size={18} />
                </span>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">{t("layout.quickAddTitle")}</h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label={t("layout.close")}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{t("layout.quickAddAmount")}</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500"
                  placeholder="0.00"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{t("layout.quickAddCategory")}</label>
                <CategorySelect
                  value={category}
                  onChange={(nextCategory) => setCategory(nextCategory)}
                  expenseType="daily"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-right text-slate-900 outline-none transition focus:border-brand-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">{t("layout.quickAddDescription")}</label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500"
                  placeholder={t("layout.quickAddDescriptionPlaceholder")}
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-400"
              >
                {isSubmitting ? t("layout.quickAddSaving") : t("layout.quickAddSave")}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default QuickAddButton;
