import AccountCard from "./AccountCard";

function AccountsList({ accounts, showArchived, status, error, adjustStatus, onToggleView, onAdjust, onToggleArchive, t }) {
  return (
    <section className="accounts-list-section">
      <div className="accounts-list-header">
        <div>
          <h2>{t("accounts.listTitle")}</h2>
          <p className="accounts-list-status">{showArchived ? "الحسابات المؤرشفة" : "الحسابات النشطة"}</p>
        </div>
        <button type="button" onClick={onToggleView} className="secondary-button">
          {showArchived ? "عرض الحسابات النشطة" : "عرض الحسابات المؤرشفة"}
        </button>
      </div>
      {status === "loading" && <p>{t("accounts.loading")}</p>}
      {error && <p className="auth-error">{error}</p>}
      {status === "succeeded" && accounts.length === 0 && <p>{showArchived ? "لا توجد حسابات مؤرشفة." : t("accounts.empty")}</p>}
      {accounts.map((account) => (
        <AccountCard key={account._id} account={account} adjustStatus={adjustStatus} onAdjust={onAdjust} onToggleArchive={onToggleArchive} t={t} />
      ))}
    </section>
  );
}

export default AccountsList;