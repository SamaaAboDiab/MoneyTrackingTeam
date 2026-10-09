import { useTranslation } from "react-i18next";
import { formatMoney, formatPercent } from "../../../utils/formatAmount";
import { categoryLabel } from "../../categories/components/mandatoryCategories";
import { ReportSkeleton } from "../../../components/common/Skeleton";

function CategoriesSection({ data, loading }) {
  const { t } = useTranslation();
  if (loading) return <ReportSkeleton label={t("reports.loading")} />;
  if (!data) return null;

  const { categories = [], totalExpenses = 0 } = data;

  if (categories.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200/80">
        <p className="text-sm text-slate-500">{t("reports.empty")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900">{t("reports.categories.title")}</h3>
        <span className="tabular-amount text-sm font-bold text-slate-700">{formatMoney(totalExpenses)}</span>
      </div>
      <div className="mt-4 space-y-3">
        {categories.map((cat) => (
          <div key={cat.categoryId}>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-semibold text-slate-700">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                {categoryLabel(cat.name)}
              </span>
              <span className="tabular-amount text-slate-500">{formatMoney(cat.total)} · {formatPercent(cat.pct, 1)}</span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full" style={{ width: `${cat.pct}%`, backgroundColor: cat.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoriesSection;
