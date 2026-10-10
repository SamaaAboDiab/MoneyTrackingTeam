import { Link } from "react-router-dom";
import { Archive, ArchiveRestore, ArrowLeft, Banknote, Landmark, Smartphone } from "lucide-react";
import AdjustBalanceButton from "./AdjustBalanceModal";
import { formatMoney } from "../../../utils/formatAmount";

const ACCOUNT_TYPE_ICONS = { bank: Landmark, wallet: Smartphone, cash: Banknote };
const FALLBACK_COLOR = "#64748b";

// One account: its color as a soft accent, name and type, the balance up front, then actions.
function AccountCard({ account, adjustStatus, onAdjust, onToggleArchive, t }) {
  const Icon = ACCOUNT_TYPE_ICONS[account.type] || Banknote;
  const color = /^#[0-9a-f]{6}$/i.test(account.color || "") ? account.color : FALLBACK_COLOR;
  const negative = Number(account.balance) < 0;

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        account.isArchived ? "opacity-60" : ""
      }`}
    >
      {/* Soft wash of the account's color behind the header */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-24" style={{ background: `linear-gradient(to bottom, ${color}1f, transparent)` }} />

      <div className="relative flex flex-1 flex-col p-5">
        <Link to={`/accounts/${account._id}/transactions`} className="flex items-start gap-3">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
            style={{ backgroundColor: color, boxShadow: `0 6px 16px -6px ${color}` }}
          >
            <Icon size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <strong className="block truncate text-base font-bold text-slate-900">{account.name}</strong>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                {t(`accounts.${account.type}`)}
              </span>
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                {account.currency || "EGP"}
              </span>
            </div>
          </div>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-300 transition group-hover:bg-slate-100 group-hover:text-slate-600">
            <ArrowLeft size={16} className="ltr:rotate-180" />
          </span>
        </Link>

        <div className="mt-5">
          <p className="text-xs font-semibold text-slate-500">{t("accounts.balance")}</p>
          <p className={`tabular-amount mt-1 text-2xl font-extrabold tracking-tight ${negative ? "text-expense" : "text-slate-900"}`}>
            {formatMoney(account.balance, account.currency)}
          </p>
        </div>

        <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
          {!account.isArchived && (
            <AdjustBalanceButton account={account} onSubmit={onAdjust} disabled={adjustStatus === "loading"} />
          )}
          <button
            type="button"
            onClick={() => onToggleArchive(account._id)}
            title={account.isArchived ? t("accounts.reactivate") : t("accounts.archive")}
            className={`inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-3 text-sm font-semibold transition ${
              account.isArchived
                ? "flex-1 bg-brand-50 text-brand-700 hover:bg-brand-100"
                : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            }`}
          >
            {account.isArchived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
            <span className={account.isArchived ? "" : "hidden sm:inline"}>
              {account.isArchived ? t("accounts.reactivate") : t("accounts.archive")}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default AccountCard;
