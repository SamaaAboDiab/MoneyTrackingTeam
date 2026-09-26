import { Bell } from "lucide-react";

function NotificationsButton({ t }) {
  return (
    <button
      type="button"
      aria-label={t("layout.notifications")}
      className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-500 sm:h-10 sm:w-10 transition hover:bg-slate-50"
    >
      <Bell size={18} />
    </button>
  );
}

export default NotificationsButton;
