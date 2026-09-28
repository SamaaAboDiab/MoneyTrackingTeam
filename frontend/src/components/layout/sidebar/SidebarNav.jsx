import { NavLink } from "react-router-dom";
import { NAV_ITEMS, isNavItemActive } from "./navItems";

function SidebarNav({ collapsed, pathname, t }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {NAV_ITEMS.map(({ to, key, icon: Icon }) => {
        const isActive = isNavItemActive(to, pathname);
        return (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? t(key) : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
              collapsed ? "justify-center" : ""
            } ${isActive ? "bg-brand-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}
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
