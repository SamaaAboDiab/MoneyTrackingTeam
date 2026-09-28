import { Link } from "react-router-dom";
import { Wallet, AlertTriangle } from "lucide-react";
import { formatAmount } from "../../../utils/formatAmount";

function CashBalanceWidget({ cashAccount, t }) {
  const balance = Number(cashAccount?.balance || 0);
  const isEmpty = Boolean(cashAccount) && balance <= 0;

  return (
    <Link
      to="/cash"
      className="mt-6 flex items-center justify-between gap-3 rounded-2xl bg-white p-5 shadow-sm shadow-slate-200 ring-1 ring-slate-100 transition hover:ring-brand-300"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Wallet size={18} />
        </span>
        <div>
          <p className="text-sm font-medium text-slate-500">{t("cash.widgetLabel")}</p>
          {cashAccount ? (
            <p className="tabular-amount text-lg font-extrabold text-slate-900">
              {formatAmount(balance)} {cashAccount.currency || "EGP"}
            </p>
          ) : (
            <p className="text-sm font-semibold text-slate-500">{t("cash.widgetNoAccount")}</p>
          )}
        </div>
      </div>

      {isEmpty && (
        <span className="flex items-center gap-1.5 rounded-full bg-expense-soft px-3 py-1 text-xs font-semibold text-expense">
          <AlertTriangle size={14} />
          {t("cash.emptyAlert")}
        </span>
      )}
    </Link>
  );
}

export default CashBalanceWidget;
