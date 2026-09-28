import { Link } from "react-router-dom";
import { Landmark, Smartphone, Banknote } from "lucide-react";
import AdjustBalanceButton from "./AdjustBalanceModal";

const ACCOUNT_TYPE_STYLE = {
  bank: { icon: Landmark, badge: "bg-blue-50 text-blue-600" },
  wallet: { icon: Smartphone, badge: "bg-violet-50 text-violet-600" },
  cash: { icon: Banknote, badge: "bg-emerald-50 text-emerald-600" },
};

function AccountCard({ account, adjustStatus, onAdjust, onToggleArchive, t }) {
  const { icon: Icon, badge } = ACCOUNT_TYPE_STYLE[account.type] || {
    icon: Banknote,
    badge: "bg-slate-100 text-slate-600",
  };

  return (
    <article
      className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm shadow-slate-200 ring-1 ring-slate-100"
      style={{ opacity: account.isArchived ? 0.6 : 1 }}
    >
      <Link to={`/accounts/${account._id}/transactions`} className="flex items-start gap-3">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${badge}`}>
          <Icon size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <strong className="block truncate text-slate-900" style={{ color: account.color }}>
            {account.name}
          </strong>
          <span className="text-xs font-medium text-slate-500">{t(`accounts.${account.type}`)}</span>
        </div>
      </Link>

      <p
        className={`tabular-amount text-xl font-bold ${
          Number(account.balance) < 0 ? "text-expense" : "text-slate-900"
        }`}
      >
        {t("accounts.balance")}: {Number(account.balance).toLocaleString(undefined, { maximumFractionDigits: 2 })}{" "}
        {account.currency}
      </p>

      <div className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-3">
        {!account.isArchived && (
          <AdjustBalanceButton account={account} onSubmit={onAdjust} disabled={adjustStatus === "loading"} />
        )}

        <button
          type="button"
          onClick={() => onToggleArchive(account._id)}
          className="whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
        >
          {account.isArchived ? t("accounts.reactivate") : t("accounts.archive")}
        </button>
      </div>
    </article>
  );
}

export default AccountCard;
