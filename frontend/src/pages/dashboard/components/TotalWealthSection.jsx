import TotalWealthCard from "../../../components/dashboard/TotalWealthCard";

function TotalWealthSection({ status, totalCurrencies, t }) {
  if (status === "loading") {
    return (
      <div className="rounded-3xl bg-brand-600 p-6 text-white sm:p-8">
        <p className="text-sm font-medium text-white/70">{t("accounts.totalWealth")}</p>
        <p className="mt-2 text-2xl font-extrabold">{t("accounts.loading")}</p>
      </div>
    );
  }

  if (totalCurrencies.length === 0) {
    return (
      <div className="rounded-3xl bg-brand-600 p-6 text-white sm:p-8">
        <p className="text-sm font-medium text-white/70">{t("accounts.totalWealth")}</p>
        <p className="mt-2 text-lg font-semibold text-white/90">{t("accounts.noBalance")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {totalCurrencies.map(([currency, total]) => (
        <TotalWealthCard
          key={currency}
          label={t("accounts.totalWealth")}
          amount={total}
          currency={currency}
          showAriaLabel={t("common.showAmount")}
          hideAriaLabel={t("common.hideAmount")}
        />
      ))}
    </div>
  );
}

export default TotalWealthSection;
