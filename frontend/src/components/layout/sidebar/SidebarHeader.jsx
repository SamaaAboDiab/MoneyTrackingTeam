import { ChevronLeft, ChevronRight } from "lucide-react";

function SidebarHeader({ collapsed, onToggleCollapsed, t, tagline }) {
  if (collapsed) {
    return (
      <div className="flex items-center justify-center gap-1.5 px-3 py-3.5">
        <img src="/logo-white.svg" alt="" className="h-9 w-9 shrink-0 rounded-xl" />
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={t("layout.expandSidebar")}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          <ChevronRight size={16} className="rtl:rotate-180" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-1.5 px-3 py-3.5">
      <div className="flex min-w-0 items-center gap-2">
        <img src="/logo-white.svg" alt="" className="h-9 w-9 shrink-0 rounded-xl" />
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-base font-extrabold text-white">
            {t("layout.brand")}
          </span>
          <span className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {tagline || t("layout.tagline")}
          </span>
        </span>
      </div>

      <button
        type="button"
        onClick={onToggleCollapsed}
        aria-label={t("layout.collapseSidebar")}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
      >
        <ChevronLeft size={16} className="rtl:rotate-180" />
      </button>
    </div>
  );
}

export default SidebarHeader;
