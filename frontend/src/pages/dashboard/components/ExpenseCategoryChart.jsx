import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart } from "lucide-react";
import { formatAmount } from "../../../utils/formatAmount";

const SIZE = 200;
const CENTER = SIZE / 2;
const OUTER_R = 90;
const INNER_R = 58;
const GAP_RAD = 0.015;

function polarToCartesian(radius, angle) {
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle),
  };
}

function donutSlicePath(startAngle, endAngle) {
  const start = Math.min(startAngle + GAP_RAD, endAngle);
  const end = Math.max(endAngle - GAP_RAD, start);
  const startOuter = polarToCartesian(OUTER_R, start);
  const endOuter = polarToCartesian(OUTER_R, end);
  const startInner = polarToCartesian(INNER_R, end);
  const endInner = polarToCartesian(INNER_R, start);
  const largeArc = end - start > Math.PI ? 1 : 0;

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${OUTER_R} ${OUTER_R} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${INNER_R} ${INNER_R} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}`,
    "Z",
  ].join(" ");
}

function ExpenseCategoryChart({ categories, t }) {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState(null);

  const total = categories.reduce((sum, cat) => sum + Number(cat.total || 0), 0);
  const topThree = [...categories].sort((a, b) => b.total - a.total).slice(0, 3);

  const goToCategory = (name) => {
    navigate(`/expenses?category=${encodeURIComponent(name)}`);
  };

  const slices = categories.reduce((acc, cat) => {
    const fraction = total > 0 ? Number(cat.total || 0) / total : 0;
    const startAngle = acc.length > 0 ? acc[acc.length - 1].endAngle : -Math.PI / 2;
    const endAngle = startAngle + fraction * 2 * Math.PI;
    acc.push({ ...cat, startAngle, endAngle, fraction });
    return acc;
  }, []);

  const hovered = slices.find((slice) => slice.categoryId === hoveredId);

  return (
    <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100">
      <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
        <PieChart size={18} className="text-brand-600" />
        {t("dashboard.chart.title")}
      </h2>

      {categories.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">{t("dashboard.chart.empty")}</p>
      ) : (
        <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
            <svg
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              width={SIZE}
              height={SIZE}
              role="img"
              aria-label={t("dashboard.chart.title")}
            >
              {slices.map((slice) => (
                <path
                  key={slice.categoryId}
                  d={donutSlicePath(slice.startAngle, slice.endAngle)}
                  fill={slice.color}
                  className="cursor-pointer transition-opacity"
                  style={{ opacity: hoveredId && hoveredId !== slice.categoryId ? 0.45 : 1 }}
                  onMouseEnter={() => setHoveredId(slice.categoryId)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => goToCategory(slice.name)}
                >
                  <title>{`${slice.name}: ${formatAmount(slice.total)} EGP`}</title>
                </path>
              ))}
            </svg>

            {/* التسمية في مركز الدونت: الإجمالي، أو تفاصيل التصنيف اللي عليه الماوس */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              {hovered ? (
                <>
                  <span className="max-w-[7rem] truncate text-xs font-semibold text-slate-500">{hovered.name}</span>
                  <strong className="tabular-amount text-sm font-extrabold text-slate-900">
                    {formatAmount(hovered.total)}
                  </strong>
                  <span className="text-[11px] text-slate-400">
                    {Math.round(hovered.fraction * 100)}%
                  </span>
                </>
              ) : (
                <>
                  <span className="text-xs font-medium text-slate-500">{t("expenses.totalLabel")}</span>
                  <strong className="tabular-amount text-lg font-extrabold text-slate-900">
                    {formatAmount(total)}
                  </strong>
                  <span className="text-[11px] text-slate-400">EGP</span>
                </>
              )}
            </div>
          </div>

          <div className="w-full flex-1">
            {/* أعلى 3 تصنيفات */}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {topThree.map((cat, index) => (
                <button
                  key={cat.categoryId}
                  type="button"
                  onClick={() => goToCategory(cat.name)}
                  className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 text-start transition hover:border-brand-200 hover:bg-brand-50"
                >
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: cat.color }}
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold text-slate-700">{cat.name}</span>
                    <span className="tabular-amount block text-sm font-bold text-slate-900">
                      {formatAmount(cat.total)}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            {/* الليجند الكامل */}
            <div className="mt-4 flex flex-col gap-2">
              {slices.map((slice) => (
                <button
                  key={slice.categoryId}
                  type="button"
                  onMouseEnter={() => setHoveredId(slice.categoryId)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => goToCategory(slice.name)}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-start text-sm transition hover:bg-slate-50"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className="truncate font-medium text-slate-700">{slice.name}</span>
                  </span>
                  <span className="tabular-amount shrink-0 font-semibold text-slate-900">
                    {formatAmount(slice.total)} · {Math.round(slice.fraction * 100)}%
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default ExpenseCategoryChart;
