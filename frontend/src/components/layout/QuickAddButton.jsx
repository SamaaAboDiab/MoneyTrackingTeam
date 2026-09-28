import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Plus, X } from "lucide-react";
import { fetchAccounts } from "../../store/slices/accountsSlice";
import { createExpense } from "../../api/expenseApi";
import { listCategories } from "../../api/categoryApi";
import { extractError } from "../../utils/errorHandler";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-500";

function QuickAddButton() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { items: accounts } = useSelector((state) => state.accounts);

  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const cashAccount = accounts.find((account) => account.type === "cash" && !account.isArchived);

  useEffect(() => {
    if (!open) return;
    dispatch(fetchAccounts());
    listCategories()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [open, dispatch]);

  const close = () => {
    setOpen(false);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0 || !category) {
      setError(t("quickAdd.required"));
      return;
    }
    if (!cashAccount) {
      setError(t("quickAdd.noCashAccount"));
      return;
    }

    setSaving(true);
    setError("");
    try {
      await createExpense({
        amount: value,
        description: description.trim() || t("quickAdd.defaultDescription"),
        date: new Date().toISOString().slice(0, 10),
        paymentMethod: "cash",
        expenseType: "daily",
        category,
        accountId: cashAccount._id,
        currency: cashAccount.currency || "EGP",
        status: "confirmed",
      });
      setAmount("");
      setCategory("");
      setDescription("");
      setOpen(false);
      setToast(t("quickAdd.success"));
      setTimeout(() => setToast(""), 3500);
      dispatch(fetchAccounts());
    } catch (err) {
      setError(extractError(err, t("quickAdd.error")));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={t("quickAdd.button")}
        aria-label={t("quickAdd.button")}
        className="fixed bottom-20 inset-e-4 z-40 sm:bottom-6 sm:inset-e-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700"
      >
        <Plus size={26} />
      </button>

      {toast && (
        <div className="fixed bottom-36 inset-e-4 z-50 sm:bottom-24 sm:inset-e-6 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-2xl">
          {toast}
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={() => !saving && close()}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-5 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">{t("quickAdd.title")}</h2>
              <button type="button" onClick={close} className="rounded p-1 text-slate-400 hover:bg-slate-100">
                <X size={16} />
              </button>
            </div>

            <label className="block text-sm font-semibold text-slate-700">
              {t("quickAdd.amount")}
              <input
                autoFocus
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
                className={inputClass}
              />
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              {t("quickAdd.category")}
              <select value={category} onChange={(event) => setCategory(event.target.value)} className={inputClass}>
                <option value="">{t("quickAdd.selectCategory")}</option>
                {categories.map((cat) => (
                  <option key={cat._id || cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              {t("quickAdd.description")}
              <input value={description} onChange={(event) => setDescription(event.target.value)} className={inputClass} />
            </label>

            {error && <p className="rounded-xl bg-expense-soft px-3 py-2 text-sm text-expense">{error}</p>}

            <div className="flex justify-end gap-2">
              <button type="button" onClick={close} disabled={saving} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
                {t("quickAdd.cancel")}
              </button>
              <button type="submit" disabled={saving} className="rounded-xl bg-brand-600 px-5 py-2 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">
                {saving ? t("quickAdd.submitting") : t("quickAdd.submit")}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default QuickAddButton;
