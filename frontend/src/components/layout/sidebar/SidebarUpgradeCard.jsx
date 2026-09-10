import { Gem } from "lucide-react";

function SidebarUpgradeCard({ collapsed, t }) {
  if (collapsed) {
    return (
      <button
        type="button"
        title={t("layout.upgradeTitle")}
        className="flex h-10 w-full items-center justify-center rounded-xl bg-slate-50 text-brand-600 ring-1 ring-slate-100 transition hover:bg-slate-100"
      >
        <Gem size={18} />
      </button>
    );
  }

  return (
    <div className="rounded-2xl bg-slate-50 p-4 text-center ring-1 ring-slate-100">
      <Gem size={20} className="mx-auto text-brand-600" />
      <p className="mt-2 text-sm font-bold text-slate-900">{t("layout.upgradeTitle")}</p>
      <p className="mt-0.5 text-xs text-slate-500">{t("layout.upgradeSubtitle")}</p>
      <button
        type="button"
        className="mt-3 w-full rounded-lg bg-brand-600 py-2 text-xs font-bold text-white transition hover:bg-brand-700"
      >
        {t("layout.upgradeButton")}
      </button>
    </div>
  );
}

export default SidebarUpgradeCard;
