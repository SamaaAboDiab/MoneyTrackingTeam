import { useTranslation } from "react-i18next";
import { CreditCard } from "lucide-react";
import DebtCard from "./DebtCard";

function DebtsList({ debtsLoadingStatus, debts, displayedDebts, activeTab, ...cardProps }) {
  const { t } = useTranslation();

  return (
    <>
    {debtsLoadingStatus === "loading" && debts.length === 0 ? (
      <div className="rounded-2xl bg-white p-12 text-center text-slate-500 shadow-sm ring-1 ring-slate-100">
        {t("debts.loading")}
      </div>
    ) : displayedDebts.length === 0 ? (
      <div className="rounded-2xl bg-white p-12 text-center text-slate-500 shadow-sm ring-1 ring-slate-100">
        <CreditCard className="mx-auto mb-3 text-slate-300" size={42} />
        <p className="text-base font-semibold text-slate-700">
          {activeTab === "active"
            ? t("debts.empty.activeTitle")
            : activeTab === "completed"
            ? t("debts.empty.completedTitle")
            : t("debts.empty.allTitle")}
        </p>
        <p className="mt-1 text-sm text-slate-400">
          {activeTab === "active"
            ? t("debts.empty.activeSubtitle")
            : t("debts.empty.otherSubtitle")}
        </p>
      </div>
    ) : (
        <div className="grid gap-5">
          {displayedDebts.map((debt) => (
            <DebtCard key={debt._id} debt={debt} {...cardProps} />
          ))}
        </div>
      )}
    </>
  );
}

export default DebtsList;
