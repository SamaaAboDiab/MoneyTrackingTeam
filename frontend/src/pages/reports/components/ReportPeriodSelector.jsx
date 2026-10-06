import { useTranslation } from "react-i18next";

const PERIODS = [
  { key: "1y", months: 12 },
  { key: "6m", months: 6 },
  { key: "3m", months: 3 },
  { key: "1m", months: 1 },
];

function ReportPeriodSelector({ months, onChange }) {
  const { t } = useTranslation();
  return (
    <div className="inline-flex overflow-hidden rounded-xl border border-slate-200 bg-white">
      {PERIODS.map(({ key, months: value }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(value)}
          className={`min-h-11 px-3.5 py-2 text-xs font-bold transition-colors ${
            months === value ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          {t(`reports.period.${key}`)}
        </button>
      ))}
    </div>
  );
}

export default ReportPeriodSelector;
