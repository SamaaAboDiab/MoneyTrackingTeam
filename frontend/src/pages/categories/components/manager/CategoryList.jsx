import { useTranslation } from "react-i18next";

function CategoryList({ categories, loading, openEditForm, setDeleteTarget, MANDATORY_CATEGORIES, typeInfo }) {
  const { t } = useTranslation();
  return (
    <>
    <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">
      {loading ? (
        <p className="p-4 text-sm text-slate-500">{t("categoriesPage.loading")}</p>
      ) : categories.length === 0 ? (
        <p className="p-4 text-sm text-slate-500">{t("categoriesPage.empty")}</p>
      ) : (
        categories.map((cat) => (
          <div key={cat._id} className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-slate-800">{cat.name}</span>
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
