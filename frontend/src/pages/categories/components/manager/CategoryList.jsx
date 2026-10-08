import { useTranslation } from "react-i18next";
import { categoryLabel } from "../mandatoryCategories";
import { ListSkeleton } from "../../../../components/common/Skeleton";

function CategoryList({ categories, loading, openEditForm, setDeleteTarget, MANDATORY_CATEGORIES, typeInfo }) {
  const { t } = useTranslation();
  return (
    <>
    <div className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/80">
      {loading ? (
        <ListSkeleton rows={6} compact label={t("categoriesPage.loading")} />
      ) : categories.length === 0 ? (
        <p className="p-4 text-sm text-slate-500">{t("categoriesPage.empty")}</p>
      ) : (
        categories.map((cat) => (
          <div key={cat._id} className="flex items-center justify-between gap-3 px-4 py-3.5 transition hover:bg-slate-50/60">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-block h-3 w-3 shrink-0 rounded-full ring-1 ring-black/5" style={{ backgroundColor: cat.color || "#6b7280" }} />
              <span className="text-sm font-semibold text-slate-800">{categoryLabel(cat.name)}</span>
              {/* نوع التصنيف */}
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeInfo(cat.type).pill}`}>
                {typeInfo(cat.type).label}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Fix #7 — زرار التعديل متاح للكل لكن الـ backend هيمنع تغيير الاسم/النوع للـ defaults */}
              <button
                type="button"
                onClick={() => openEditForm(cat)}
                className="text-sm font-medium text-brand-600 hover:underline"
              >
                {t("common.edit")}
              </button>
              {/* زرار الحذف مخفي تماماً للتصنيفات الإلزامية */}
              {!cat.isDefault && !MANDATORY_CATEGORIES.includes(cat.name) && (
                <button
                  type="button"
                  onClick={() => setDeleteTarget(cat)}
                  className="text-sm font-medium text-rose-600 hover:underline"
                >
                  {t("common.delete")}
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
    </>
  );
}

export default CategoryList;
