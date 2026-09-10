import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";

function SidebarUserSection({ collapsed, user, onLogoutClick, t }) {
  const initial = user?.name?.trim()?.[0]?.toUpperCase() || "?";

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      {!collapsed ? (
        <Link to="/profile" className="flex items-center gap-3 rounded-xl px-1 py-1 transition hover:bg-slate-50">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="h-9 w-9 shrink-0 rounded-full object-cover" />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
              {initial}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-900">{user?.name}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
        </Link>
      ) : (
        <Link to="/profile" className="mx-auto flex h-9 w-9 items-center justify-center rounded-full">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
              {initial}
            </span>
          )}
        </Link>
      )}

      <button
        type="button"
        onClick={onLogoutClick}
        title={collapsed ? t("layout.logout") : undefined}
        className={`mt-3 flex items-center gap-3 rounded-xl px-2 py-2 text-sm font-semibold text-expense transition hover:bg-expense-soft ${
          collapsed ? "w-full justify-center" : "w-full"
        }`}
      >
        <LogOut size={18} />
        {!collapsed && t("layout.logout")}
      </button>
    </div>
  );
}

export default SidebarUserSection;
