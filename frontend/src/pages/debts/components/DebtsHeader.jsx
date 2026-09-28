import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CreditCard, Plus } from "lucide-react";

function DebtsHeader({ showAddForm, setShowAddForm, setError, setSuccessMessage }) {
  const { t } = useTranslation();

  return (
    <>
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900">
          <CreditCard className="text-brand-600" size={26} />
          {t("nav.debts")}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {t("debts.subtitle")}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
      <button
        type="button"
        onClick={() => {
          setShowAddForm((prev) => !prev);
          setError("");
          setSuccessMessage("");
        }}
        className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
      >
        <Plus size={18} />
        {showAddForm ? t("debts.cancel") : t("debts.addNew")}
      </button>
      <Link to="/dashboard" className="font-semibold text-brand-700 hover:underline">
        {t("common.backToDashboard")}
      </Link>
      </div>
    </div>

    </>
  );
}

export default DebtsHeader;
