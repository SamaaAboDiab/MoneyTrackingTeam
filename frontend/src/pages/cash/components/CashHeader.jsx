import { Link } from "react-router-dom";
import { Banknote } from "lucide-react";
import { useTranslation } from "react-i18next";

function CashHeader() {
  const { t } = useTranslation();

  return (
    <>
    <div className="flex items-center justify-between gap-3">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900"><Banknote className="text-brand-600" size={25} />{t("nav.cash")}</h1>
        <p className="mt-1 text-sm text-slate-500">{t("cash.subtitle")}</p>
      </div>
      <Link to="/dashboard" className="font-semibold text-brand-700 hover:underline">{t("common.backToDashboard")}</Link>
    </div>
    </>
  );
}

export default CashHeader;
