import { Wallet, ChevronLeft, ChevronRight } from "lucide-react";

function SidebarHeader({ collapsed, onToggleCollapsed, t }) {
  return (
    <div className="flex items-center justify-between gap-1.5 px-3 py-4">
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
          <Wallet size={18} strokeWidth={2.25} />
        </span>
        {!collapsed && (
          <span className="truncate text-base font-extrabold leading-tight text-slate-900">
            {t("layout.brand")}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onToggleCollapsed}
        aria-label={t(collapsed ? "layout.expandSidebar" : "layout.collapseSidebar")}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
      >
        {collapsed ? (
          <ChevronRight size={16} className="rtl:rotate-180" />
        ) : (
          <ChevronLeft size={16} className="rtl:rotate-180" />
        )}
      </button>
    </div>
  );
}

export default SidebarHeader;
