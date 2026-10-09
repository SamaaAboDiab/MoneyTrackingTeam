import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Receipt } from "lucide-react";
import { formatMoney } from "../../../utils/formatAmount";

function CashBalanceCard({ cashTotals = [], hasCashAccount }) {
  const { t } = useTranslation();
  const [[currency, cashBalance] = ["EGP", 0], ...others] = cashTotals;

  return (
    <>
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">{t("cash.totalBalance")}</p>
        {hasCashAccount && (
          <Link
            to="/cash/expenses"
            className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-brand-50 px-3.5 py-2 text-sm font-bold text-brand-700 ring-1 ring-brand-200 transition hover:bg-brand-100"
          >
            <Receipt size={16} />
            {t("cash.viewExpenses")}
          </Link>
        )}
      </div>
      <p className="tabular-amount mt-1 text-3xl font-extrabold text-slate-900">{formatMoney(cashBalance, currency)}</p>
      {others.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {others.map(([code, total]) => (
            <span key={code} className="tabular-amount rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700">
              + {formatMoney(total, code)}
            </span>
          ))}
        </div>
      )}
      {hasCashAccount && cashBalance <= 0 && (
        <p className="mt-3 inline-flex items-center gap-2 rounded-xl bg-expense-soft px-3 py-2 text-sm font-semibold text-expense">
          {t("cash.emptyAlert")}
        </p>
      )}
    </div>
    </>
  );
}

export default CashBalanceCard;
