import { useTranslation } from "react-i18next";
import { categoryLabel } from "../mandatoryCategories";

function DeleteCategoryModal({ deleteTarget, setDeleteTarget, deleting, handleDelete }) {
  const { t } = useTranslation();
  return (
    <>
    {deleteTarget && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
        onClick={() => !deleting && setDeleteTarget(null)}
      >
        <div
          className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-base font-semibold text-slate-900">{t("categoriesPage.deleteConfirmTitle")}</h2>
          <p className="mt-2 text-sm text-slate-600">
            {t("categoriesPage.deleteConfirmMessage", { name: categoryLabel(deleteTarget.name) })}
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg bg-rose-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
            >
              {deleting ? t("categoriesPage.deleting") : t("categoriesPage.confirmDelete")}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

export default DeleteCategoryModal;
