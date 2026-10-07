import { useTranslation } from "react-i18next";
import Select from "../../../../components/common/Select";
import { categoryLabel } from "../mandatoryCategories";

function CategoryFormModal({ formOpen, closeForm, handleSave, editingId, editingCat, name, setName, type, setType, color, setColor, formError, saving, TYPE_OPTIONS }) {
  const { t } = useTranslation();
  return (
    <>
    {formOpen && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
        onClick={closeForm}
      >
        <form
          onSubmit={handleSave}
          className="max-h-[calc(100dvh-2rem)] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-4 shadow-xl sm:p-5"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-base font-semibold text-slate-900">
            {editingId ? t("categoriesPage.formTitleEdit") : t("categoriesPage.formTitleNew")}
          </h2>

          {/* اسم التصنيف — معطّل للـ defaults */}
          <label htmlFor="category-name" className="mt-4 block text-sm font-medium text-slate-700">{t("categoriesPage.nameLabel")}</label>
          <input
            id="category-name"
            type="text"
            autoFocus
            required
            maxLength={50}
            placeholder={t("categoriesPage.namePlaceholder")}
            value={editingCat?.isDefault ? categoryLabel(name) : name}
            onChange={(e) => setName(e.target.value)}
            disabled={editingCat?.isDefault}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-slate-50 disabled:text-slate-400"
          />
          {editingCat?.isDefault && (
            <p className="mt-1 text-xs text-slate-400">{t("categoriesPage.nameLocked")}</p>
          )}

          {/* نوع التصنيف — Fix #2 & #3 — معطّل للـ defaults */}
          <label htmlFor="category-type" className="mt-3 block text-sm font-medium text-slate-700">{t("categoriesPage.typeLabel")}</label>
          <Select
            id="category-type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            disabled={editingCat?.isDefault}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-slate-50 disabled:text-slate-400"
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
          {editingCat?.isDefault && (
            <p className="mt-1 text-xs text-slate-400">{t("categoriesPage.typeLocked")}</p>
          )}

          {/* اللون — متاح للكل حتى الـ defaults */}
          <label htmlFor="category-color" className="mt-3 block text-sm font-medium text-slate-700">{t("categoriesPage.colorLabel")}</label>
          <input
            id="category-color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="mt-1 h-9 w-16 rounded-lg border border-slate-300"
          />

          {formError && <p className="mt-2 text-sm text-rose-600">{formError}</p>}

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeForm}
              className="min-h-11 w-full rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 sm:w-auto"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-h-11 w-full rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60 sm:w-auto"
            >
              {saving ? t("categoriesPage.saving") : t("categoriesPage.save")}
            </button>
          </div>
        </form>
      </div>
    )}
    </>
  );
}

export default CategoryFormModal;
