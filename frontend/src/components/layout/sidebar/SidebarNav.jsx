import { NavLink } from "react-router-dom";
import { NAV_ITEMS, isNavItemActive } from "./navItems";

const DESKTOP_NAV_ITEMS = NAV_ITEMS.filter(({ to }) => to !== "/categories");

function SidebarNav({ collapsed, pathname, t, items = DESKTOP_NAV_ITEMS, isActive: isItemActive = isNavItemActive }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {items.map(({ to, key, icon: Icon }) => {
        const isActive = isItemActive(to, pathname);
        return (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? t(key) : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
              collapsed ? "justify-center" : ""
            } ${
              isActive
                ? "bg-brand-600 text-white emerald:bg-brand-500/10 emerald:text-brand-400 emerald:ring-1 emerald:ring-brand-500/30"
                : "text-slate-500 hover:bg-slate-50 emerald:text-slate-300 emerald:hover:bg-white/5 emerald:hover:text-white"
            }`}
          >
            <Icon size={18} strokeWidth={2} />
            {!collapsed && t(key)}
          </NavLink>
        );
      })}
    </nav>
  );
}

export default SidebarNav;
