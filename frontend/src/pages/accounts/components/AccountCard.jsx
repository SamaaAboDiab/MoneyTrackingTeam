import { Link } from "react-router-dom";
import AdjustBalanceButton from "./AdjustBalanceModal";

const accountTypeClassNames = {
  bank: "account-card account-card-bank",
  wallet: "account-card account-card-wallet",
  cash: "account-card account-card-cash",
};

function AccountCard({ account, adjustStatus, onAdjust, onToggleArchive, t }) {
  return (
    <article className={accountTypeClassNames[account.type] || "account-card"} style={{ opacity: account.isArchived ? 0.6 : 1 }}>
      <Link to={`/accounts/${account._id}/transactions`} className="account-history-link">
        <div className="account-card-header">
          <strong style={{ color: account.color }}>{account.name}</strong>
          <span className="account-type-badge">{t(`accounts.${account.type}`)}</span>
        </div>
        <p className={Number(account.balance) < 0 ? "account-balance amount-negative" : "account-balance"}>
          {t("accounts.balance")}: {Number(account.balance).toLocaleString(undefined, { maximumFractionDigits: 2 })} {account.currency}
        </p>
      </Link>
      {!account.isArchived && <AdjustBalanceButton account={account} onSubmit={onAdjust} disabled={adjustStatus === "loading"} />}
      <button type="button" className="account-archive-button" onClick={() => onToggleArchive(account._id)}>
        {account.isArchived ? "إعادة تفعيل" : "أرشفة"}
      </button>
    </article>
  );
}

export default AccountCard;