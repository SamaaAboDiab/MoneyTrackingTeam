import { Link } from "react-router-dom";
import { Wallet, Landmark, Smartphone, Banknote } from "lucide-react";
import { formatAmount } from "../../../utils/formatAmount";

const ACCOUNT_TYPE_ICON = {
  bank: Landmark,
  wallet: Smartphone,
  cash: Banknote,
};

function AccountsPreview({ status, accounts, t }) {
  return (
    <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">{t("accounts.listTitle")}</h2>
        <Link to="/accounts" className="text-sm font-semibold text-brand-700 hover:underline">
          {t("dashboard.accountsSummaryLink")}
        </Link>
      </div>

      {status === "succeeded" && accounts.length === 0 && (
        <p className="mt-3 text-slate-500">{t("accounts.empty")}</p>
      )}

      <div className="mt-4 flex flex-col gap-3">
        {accounts.slice(0, 4).map((account) => {
          const Icon = ACCOUNT_TYPE_ICON[account.type] || Wallet;
          return (
            <Link
              key={account._id}
              to={`/accounts/${account._id}/transactions`}
              className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-slate-50"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Icon size={16} />
              </span>
              <span className="min-w-0 flex-1 truncate font-medium text-slate-700">{account.name}</span>
              <span className={`tabular-amount font-bold ${Number(account.balance) < 0 ? "text-expense" : "text-slate-900"}`}>
                {formatAmount(account.balance)} {account.currency}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default AccountsPreview;
