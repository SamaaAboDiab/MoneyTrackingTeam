import { useEffect, useRef, useState } from "react";

function ExpenseFilters({
  filters,
  availableCategories,
  availableAccounts,
  isFiltered,
  getCategoryName,
  getCategoryColor,
  onFilterChange,
  onCategorySelect,
  onResetFilters,
}) {
  const [filterCatOpen, setFilterCatOpen] = useState(false);
  const filterCatRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (filterCatRef.current && !filterCatRef.current.contains(e.target)) {
        setFilterCatOpen(false);
      }
    }
    if (filterCatOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [filterCatOpen]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">قائمة المصروفات</h3>
          <p className="text-xs text-slate-500">فلترة المصروفات، وتعديلها أو حذفها مع تحديث الأرصدة تلقائياً.</p>
        </div>

        {isFiltered && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
          >
            <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
            <span>مسح الفلاتر</span>
          </button>
        )}
      </div>

      {/* شريط الفلاتر (US-204) */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* فلتر الفترة الزمنية */}
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-period" className="text-xs font-semibold text-slate-600">الفترة الزمنية</label>
          <select
            id="filter-period"
            name="period"
            value={filters.period}
            onChange={onFilterChange}
            className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-700 outline-none transition focus:border-brand-500"
          >
            <option value="all">كل الفترات</option>
            <option value="day">اليوم</option>
            <option value="week">آخر 7 أيام</option>
            <option value="month">هذا الشهر</option>
            <option value="custom">مخصص (تحديد تاريخين)</option>
          </select>
        </div>

        {/* فلتر النوع */}
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-type" className="text-xs font-semibold text-slate-600">نوع المصروف</label>
          <select
            id="filter-type"
            name="type"
            value={filters.type}
            onChange={onFilterChange}
            className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-700 outline-none transition focus:border-brand-500"
          >
            <option value="all">كل الأنواع</option>
            <option value="daily">يومي</option>
            <option value="fixed">شهري ثابت</option>
            <option value="emergency">طارئ</option>
          </select>
        </div>

        {/* فلتر التصنيف مع نقاط ملونة */}
        <div className="flex flex-col gap-1 relative" ref={filterCatRef}>
          <label htmlFor="filter-category" className="text-xs font-semibold text-slate-600">التصنيف</label>
          <button
            type="button"
            onClick={() => setFilterCatOpen((prev) => !prev)}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-700 outline-none transition focus:border-brand-500 text-right"
          >
            <span className="flex items-center gap-1.5">
              {filters.category !== "all" && (
                <span
                  className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getCategoryColor(filters.category) }}
                />
              )}
              <span>
                {filters.category === "all" ? "كل التصنيفات" : getCategoryName(filters.category)}
              </span>
            </span>
            <svg
              className={`h-3.5 w-3.5 text-slate-400 transition-transform ${filterCatOpen ? "rotate-180" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          {filterCatOpen && (
            <div className="absolute top-full z-40 mt-1 w-full rounded-xl border border-slate-200 bg-white p-1 shadow-lg max-h-56 overflow-y-auto">
              <div
                onClick={() => {
                  onCategorySelect("all");
                  setFilterCatOpen(false);
                }}
                className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs transition hover:bg-slate-100 ${
                  filters.category === "all" ? "bg-brand-50 font-bold text-brand-700" : "text-slate-700"
                }`}
              >
                كل التصنيفات
              </div>
              {availableCategories.map((cat) => (
                <div
                  key={cat._id || cat.name}
                  onClick={() => {
                    onCategorySelect(cat.name);
                    setFilterCatOpen(false);
                  }}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs transition hover:bg-slate-100 ${
                    filters.category === cat.name ? "bg-brand-50 font-bold text-brand-700" : "text-slate-700"
                  }`}
                >
                  <span
                    className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: cat.color || getCategoryColor(cat.name) }}
                  />
                  <span>{cat.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* فلتر الحساب */}
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-account" className="text-xs font-semibold text-slate-600">الحساب</label>
          <select
            id="filter-account"
            name="account"
            value={filters.account}
            onChange={onFilterChange}
            className="rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-700 outline-none transition focus:border-brand-500"
          >
            <option value="all">كل الحسابات</option>
            {availableAccounts.map((acc) => (
              <option key={acc._id} value={acc._id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* حقول التاريخ المخصص */}
      {filters.period === "custom" && (
        <div className="mt-3 grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="filter-startDate" className="text-xs font-semibold text-slate-600">من تاريخ</label>
            <input
              id="filter-startDate"
              name="startDate"
              type="date"
              value={filters.startDate}
              onChange={onFilterChange}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-brand-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="filter-endDate" className="text-xs font-semibold text-slate-600">إلى تاريخ</label>
            <input
              id="filter-endDate"
              name="endDate"
              type="date"
              value={filters.endDate}
              onChange={onFilterChange}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-brand-500"
            />
          </div>
        </div>
      )}
    </>
  );
}

export default ExpenseFilters;
