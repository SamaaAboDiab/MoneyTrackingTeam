import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories, createCategoryEntry } from "../../../store/slices/expensesSlice";

const ADD_NEW_VALUE = "__add_new__";
const DEFAULT_COLOR = "#6b7280";

export default function CategorySelect({ value, onChange }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { items: categories, status, createStatus, createError } = useSelector(
    (state) => state.expenses.categories
  );
  const loading = status === "loading" || status === "idle";

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(DEFAULT_COLOR);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchCategories());
    }
  }, [status, dispatch]);

  function handleSelectChange(e) {
    if (e.target.value === ADD_NEW_VALUE) {
      setAdding(true);
      return;
    }
    onChange?.(e.target.value);
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim()) return;

    const result = await dispatch(
      createCategoryEntry({ name: newName.trim(), color: newColor })
    );

    if (createCategoryEntry.fulfilled.match(result)) {
      onChange?.(result.payload._id); // auto-select the new category
      setAdding(false);
      setNewName("");
      setNewColor(DEFAULT_COLOR);
    }
  }

  if (adding) {
    return (
      <form onSubmit={handleCreate} className="rounded-lg border border-slate-200 p-3">
        <label className="block text-sm font-medium text-slate-700">{t("categories.newNameLabel")}</label>
        <div className="mt-1 flex items-center gap-2">
          <input
            type="text"
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
          />
          <input
            type="color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            className="h-9 w-10 rounded-lg border border-slate-300"
          />
        </div>
        {createError && <p className="mt-1 text-sm text-rose-600">{createError}</p>}
        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setAdding(false)}
            className="rounded-lg px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            {t("categories.cancel")}
          </button>
          <button
            type="submit"
            disabled={createStatus === "loading"}
            className="rounded-lg bg-teal-700 px-3 py-1 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {createStatus === "loading" ? t("categories.adding") : t("categories.add")}
          </button>
        </div>
      </form>
    );
  }

  return (
    <select
      value={value || ""}
      onChange={handleSelectChange}
      disabled={loading}
      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
    >
      <option value="" disabled>
        {loading ? t("categories.loading") : t("categories.selectPlaceholder")}
      </option>
      {categories.map((cat) => (
        <option key={cat._id} value={cat._id}>
          {cat.name}
        </option>
      ))}
      <option value={ADD_NEW_VALUE}>{t("categories.addNew")}</option>
    </select>
  );
}
