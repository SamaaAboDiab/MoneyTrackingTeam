import { Wallet, AlertTriangle } from "lucide-react";
import { formatAmount } from "../../../utils/formatAmount";

function CashBalanceCard({ cashAccount, t }) {
  const balance = Number(cashAccount?.balance || 0);
  const isEmpty = balance <= 0;

  return (
    <section className="rounded-3xl bg-brand-600 p-6 text-white sm:p-8">
      <div className="flex items-center gap-2 text-sm font-medium text-white/70">
        <Wallet size={16} />
        <span>{t("cash.balanceLabel")}</span>
      </div>
      <p className="tabular-amount mt-2 text-3xl font-extrabold">
        {formatAmount(balance)} {cashAccount?.currency || "EGP"}
      </p>

      {isEmpty && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-semibold text-white">
          <AlertTriangle size={16} />
          <span>{t("cash.emptyAlert")}</span>
        </div>
      )}
    </section>
  );
}

export default CashBalanceCard;
