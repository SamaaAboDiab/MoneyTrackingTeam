import { useEffect, useRef, useState } from "react";
import { Ban, CalendarClock, CalendarPlus, CircleCheck, Gift, MessageCircle, MoreHorizontal, UserRound } from "lucide-react";

// The less-used actions for a user, tucked behind a "⋯" button to keep the cards calm.
function UserActionsMenu({ user, t, busy, onProfile, onChat, onExtend, onFreeDays, onManualDate, onSuspend, onActivate }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const items = [
    { key: "profile", icon: UserRound, label: t("admin.users.viewProfile"), onClick: onProfile, tone: "text-slate-600" },
    { key: "chat", icon: MessageCircle, label: t("admin.users.sendMessage"), onClick: onChat, tone: "text-brand-600" },
    { key: "extend", icon: CalendarPlus, label: t("admin.users.extendSubscription"), onClick: onExtend, tone: "text-sky-600" },
    { key: "free", icon: Gift, label: t("admin.users.addFreeDays"), onClick: onFreeDays, tone: "text-amber-600" },
    { key: "manual", icon: CalendarClock, label: t("admin.users.setManualDate"), onClick: onManualDate, tone: "text-indigo-600" },
    user.isSuspended
      ? { key: "activate", icon: CircleCheck, label: busy ? t("admin.users.activating") : t("admin.users.activate"), onClick: onActivate, tone: "text-emerald-600" }
      : { key: "suspend", icon: Ban, label: t("admin.users.suspend"), onClick: onSuspend, tone: "text-red-600", danger: true },
  ];

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("admin.users.moreActions")}
        title={t("admin.users.moreActions")}
        className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
          open ? "border-brand-200 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
        }`}
      >
        <MoreHorizontal size={18} />
      </button>

      {open && (
        <div
          role="menu"
          className="toast-enter absolute bottom-full z-30 mb-2 w-56 overflow-hidden rounded-2xl bg-white p-1.5 shadow-2xl ring-1 ring-slate-200 inset-e-0"
        >
          {items.map(({ key, icon: Icon, label, onClick, tone, danger }) => (
            <button
              key={key}
              type="button"
              role="menuitem"
              disabled={busy && key === "activate"}
              onClick={() => {
                setOpen(false);
                onClick();
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm font-semibold transition disabled:opacity-60 ${
                danger ? "text-red-700 hover:bg-red-50" : "text-slate-700 hover:bg-slate-50"
              } ${key === "suspend" || key === "activate" || key === "extend" ? "mt-1 border-t border-slate-100" : ""}`}
            >
              <Icon size={16} className={tone} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserActionsMenu;
