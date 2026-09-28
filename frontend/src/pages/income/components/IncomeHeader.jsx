import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function IncomeHeader() {
  const { t } = useTranslation();

  return (
    <>
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          {t("income.title")}
        </h1>

        <p className="mt-1 text-slate-500">
          {t("income.description")}
        </p>
      </div>

      <Link
        to="/dashboard"
        className="font-semibold text-brand-700 hover:underline"
      >
        {t("common.backToDashboard")}
      </Link>
    </div>
    </>
  );
}

export default IncomeHeader;
