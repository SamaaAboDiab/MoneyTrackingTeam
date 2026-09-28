import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatAmount } from "../../../utils/formatAmount";

function CashBalanceCard({ cashBalance, hasCashAccount }) {
  const { t } = useTranslation();

  return (
    <>
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <p className="text-sm text-slate-500">{t("cash.totalBalance")}</p>
      <p className="mt-1 text-3xl font-extrabold text-slate-900">{formatAmount(cashBalance)} EGP</p>
      {hasCashAccount && cashBalance <= 0 && (
        <p className="mt-3 inline-flex items-center gap-2 rounded-xl bg-expense-soft px-3 py-2 text-sm font-semibold text-expense">
          {t("cash.emptyAlert")}
        </p>
      )}
      {hasCashAccount && (
        <Link to="/cash/expenses" className="mt-3 block text-sm font-semibold text-brand-700 hover:underline">
          {t("cash.viewExpenses")}
        </Link>
      )}
    </div>
    </>
  );
}

export default CashBalanceCard;
