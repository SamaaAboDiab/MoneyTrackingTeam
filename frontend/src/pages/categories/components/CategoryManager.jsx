import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategories,
  createCategoryEntry,
  updateCategoryEntry,
  deleteCategoryEntry,
} from "../../../store/slices/expensesSlice";

const DEFAULT_COLOR = "#6b7280";

const inputClass =
  "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500";
const labelClass = "text-sm font-semibold text-slate-700";

export default function CategoryManager() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const {
    items: categories,
    status,
    error,
    createStatus,
    createError,
    updateStatus,
    updateError,
    deleteStatus,
    deleteError,
  } = useSelector((state) => state.expenses.categories);
  const loading = status === "loading" || status === "idle";
  const saving = createStatus === "loading" || updateStatus === "loading";
  const deleting = deleteStatus === "loading";

  // add/edit form state
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = adding new
  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);

  // delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState(null); // category object

  // success toast
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchCategories());
    }
  }, [status, dispatch]);

  function openAddForm() {
    setEditingId(null);
    setName("");
    setColor(DEFAULT_COLOR);
    setFormOpen(true);
  }

  function openEditForm(cat) {
    setEditingId(cat._id);
    setName(cat.name);
    setColor(cat.color || DEFAULT_COLOR);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
  }

  function flashSuccess(msg) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      const result = await dispatch(
        updateCategoryEntry({ id: editingId, payload: { name: name.trim(), color } })
      );
      if (updateCategoryEntry.fulfilled.match(result)) {
        flashSuccess(t("categories.updateSuccess"));
        closeForm();
      }
    } else {
      const result = await dispatch(createCategoryEntry({ name: name.trim(), color }));
      if (createCategoryEntry.fulfilled.match(result)) {
        flashSuccess(t("categories.createSuccess"));
        closeForm();
      }
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const result = await dispatch(deleteCategoryEntry(deleteTarget._id));
    if (deleteCategoryEntry.fulfilled.match(result)) {
      setDeleteTarget(null);
      flashSuccess(t("categories.deleteSuccess"));
    }
  }

  const formError = editingId ? updateError : createError;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">{t("categories.title")}</h1>
          <p className="mt-1 text-slate-500">{t("categories.description")}</p>
        </div>

        <Link to="/dashboard" className="font-semibold text-brand-700 hover:underline">
          {t("common.backToDashboard")}
        </Link>
      </div>

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900">{t("categories.title")}</h2>
          <button
            type="button"
            onClick={openAddForm}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700"
          >
            {t("categories.addNew")}
          </button>
        </div>

        {successMsg && (
          <p className="mt-4 rounded-xl bg-income-soft px-4 py-2.5 text-sm font-medium text-income">
            {successMsg}
          </p>
        )}
        {(error || deleteError) && (
          <p className="mt-4 rounded-xl bg-expense-soft px-4 py-2.5 text-sm font-medium text-expense">
            {error || deleteError}
          </p>
        )}

        {loading ? (
          <p className="mt-4 text-slate-500">{t("categories.loading")}</p>
        ) : categories.length === 0 ? (
          <p className="mt-4 text-slate-500">{t("categories.empty")}</p>
        ) : (
          <div className="mt-4 flex flex-col divide-y divide-slate-100">
            {categories.map((cat) => (
              <div key={cat._id} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3.5 w-3.5 rounded-full"
                    style={{ backgroundColor: cat.color || DEFAULT_COLOR }}
                  />
                  <span className="text-sm font-medium text-slate-800">{cat.name}</span>
                  {cat.isDefault && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                      {t("categories.default")}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openEditForm(cat)}
                    className="text-sm font-semibold text-brand-700 hover:underline"
                  >
                    {t("categories.edit")}
                  </button>
                  {!cat.isDefault && (
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(cat)}
                      className="text-sm font-semibold text-expense hover:underline"
                    >
                      {t("categories.delete")}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add / Edit modal */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-500/20 p-4 backdrop-blur-[2px]"
          onClick={closeForm}
        >
          <form
            onSubmit={handleSave}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-slate-900">
              {editingId ? t("categories.editTitle") : t("categories.addTitle")}
            </h2>

            <div className="mt-4 flex flex-col gap-1.5">
              <label htmlFor="category-name" className={labelClass}>
                {t("categories.nameLabel")}
              </label>
              <input
                id="category-name"
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="mt-4 flex flex-col gap-1.5">
              <label htmlFor="category-color" className={labelClass}>
                {t("categories.colorLabel")}
              </label>
              <input
                id="category-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-16 rounded-xl border border-slate-200"
              />
            </div>

            {formError && (
              <p className="mt-3 rounded-xl bg-expense-soft px-4 py-2.5 text-sm font-medium text-expense">
                {formError}
              </p>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-65"
              >
                {saving ? t("categories.saving") : t("categories.save")}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
              >
                {t("categories.cancel")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-500/20 p-4 backdrop-blur-[2px]"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-slate-900">{t("categories.deleteConfirmTitle")}</h2>
            <p className="mt-2 text-sm text-slate-600">
              {t("categories.deleteConfirmMessage", { name: deleteTarget.name })}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-xl bg-expense px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90 disabled:cursor-wait disabled:opacity-65"
              >
                {deleting ? t("categories.deleting") : t("categories.confirmDelete")}
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
              >
                {t("categories.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
