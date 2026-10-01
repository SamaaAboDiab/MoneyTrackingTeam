import TotalWealthCard from "../../../components/dashboard/TotalWealthCard";


function TotalWealthSection({ status, totalCurrencies, accountsCount, trendData, onOpenAccounts, periodIncome, periodExpenses, periodLabel, summaryCurrency = "EGP", t }) {
  if (status === "loading") {
    return (
      <div role="status" aria-live="polite" className="h-full rounded-3xl bg-brand-600 p-6 text-white sm:p-8">
        <span className="sr-only">{t("accounts.loading")}</span>
        <p className="text-sm font-medium text-white/70">{t("accounts.totalWealth")}</p>
        <div aria-hidden="true" className="mt-6 flex items-end justify-between gap-4">
          <span className="block h-11 w-48 animate-pulse rounded-full bg-white/20" />
          <span className="hidden h-16 flex-1 items-end justify-end gap-1 sm:flex">
            {[40, 65, 50, 80, 60, 90, 70].map((h, i) => (
              <span key={i} className="block w-1.5 animate-pulse rounded-full bg-white/20" style={{ height: `${h}%` }} />
            ))}
          </span>
        </div>
      </div>
    );
  }

  if (totalCurrencies.length === 0) {
    return (
      <div className="h-full rounded-3xl bg-brand-600 p-6 text-white sm:p-8">
        <p className="text-sm font-medium text-white/70">{t("accounts.totalWealth")}</p>
        <p className="mt-2 text-lg font-semibold text-white/90">{t("accounts.noBalance")}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      {totalCurrencies.map(([currency, total]) => (
        <div
          key={currency}
          className="block w-full flex-1 text-start"
        >
          <TotalWealthCard
            label={t("accounts.totalWealth")}
            amount={total}
            currency={currency}
            onOpenAccounts={onOpenAccounts}
            showAriaLabel={t("common.showAmount")}
            hideAriaLabel={t("common.hideAmount")}
            accountsCount={accountsCount}
            trendData={trendData}
            {...(currency === summaryCurrency ? { periodIncome, periodExpenses, periodLabel } : {})}
          />
        </div>
      ))}
    </div>
  );
}

export default TotalWealthSection;
