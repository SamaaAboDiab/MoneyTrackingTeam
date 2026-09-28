import { useTranslation } from "react-i18next";
import { inputClass } from "../constants";

function IncomeSummaryFilter({ selectedMonth, setSelectedMonth, summaryCurrency, setSummaryCurrency }) {
  const { t } = useTranslation();

  return (
    <>
    <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100">
      <h2 className="text-lg font-bold text-slate-900">
        {t("income.filter.title")}
      </h2>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700">
          {t("income.filter.monthYearLabel")}

          <input
            type="month"
            value={selectedMonth}
            onChange={(event) =>
              setSelectedMonth(event.target.value)
            }
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700">
          {t("income.filter.baseCurrencyLabel")}

          <select
            value={summaryCurrency}
            onChange={(event) =>
              setSummaryCurrency(event.target.value)
            }
            className={inputClass}
          >
            <option value="EGP">EGP</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </label>
      </div>
    </section>
    </>
  );
}

export default IncomeSummaryFilter;
