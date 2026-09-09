import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Banknote } from "lucide-react";

function CashPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-lg rounded-3xl bg-white p-10 text-center shadow-sm shadow-slate-200 ring-1 ring-slate-100">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <Banknote size={26} />
      </span>
      <h1 className="mt-4 text-2xl font-extrabold text-slate-900">{t("nav.cash")}</h1>
      <p className="mt-2 text-slate-500">{t("common.comingSoon")}</p>
      <Link to="/dashboard" className="mt-6 inline-block font-semibold text-brand-700 hover:underline">
        {t("common.backToDashboard")}
      </Link>
    </div>
  );
}

export default CashPage;
