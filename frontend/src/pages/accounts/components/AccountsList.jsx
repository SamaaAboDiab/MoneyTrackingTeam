import AccountCard from "./AccountCard";

function AccountsList({ accounts, showArchived, status, error, adjustStatus, onToggleView, onAdjust, onToggleArchive, t }) {
  return (
    <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{t("accounts.listTitle")}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {showArchived ? t("accounts.archivedTitle") : t("accounts.activeTitle")}
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleView}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
        >
          {showArchived ? t("accounts.viewActive") : t("accounts.viewArchived")}
        </button>
      </div>

      {status === "loading" && <p className="mt-4 text-slate-500">{t("accounts.loading")}</p>}
      {error && (
        <p className="mt-4 rounded-xl bg-expense-soft px-4 py-2.5 text-sm font-medium text-expense">{error}</p>
      )}
      {status === "succeeded" && accounts.length === 0 && (
        <p className="mt-4 text-slate-500">{showArchived ? t("accounts.emptyArchived") : t("accounts.empty")}</p>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <AccountCard
            key={account._id}
            account={account}
            adjustStatus={adjustStatus}
            onAdjust={onAdjust}
            onToggleArchive={onToggleArchive}
            t={t}
          />
        ))}
      </div>
    </section>
  );
}

export default AccountsList;
