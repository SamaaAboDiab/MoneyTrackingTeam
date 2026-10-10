import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AlarmClock,
  Bell,
  BellOff,
  CheckCheck,
  CalendarClock,
  CalendarX,
  ClipboardCheck,
  ClipboardX,
  Megaphone,
  CircleAlert,
  MessageCircle,
  PartyPopper,
  UserPlus,
  WalletMinimal,
} from "lucide-react";
import usePolling from "../chat/usePolling";
import { formatMoney } from "../../utils/formatAmount";

const POLL_MS = 30000;

// How each kind of notification looks.
const TYPES = {
  chatMessage: { icon: MessageCircle, tone: "bg-brand-50 text-brand-600" },
  userMessage: { icon: MessageCircle, tone: "bg-brand-50 text-brand-600" },
  subscriptionExpiring: { icon: CalendarClock, tone: "bg-amber-50 text-amber-600" },
  subscriptionExpired: { icon: CalendarX, tone: "bg-red-50 text-red-600" },
  subscriptionsExpiring: { icon: CalendarClock, tone: "bg-amber-50 text-amber-600" },
  subscriptionsExpired: { icon: CalendarX, tone: "bg-red-50 text-red-600" },
  debtDueSoon: { icon: AlarmClock, tone: "bg-amber-50 text-amber-600" },
  debtOverdue: { icon: CircleAlert, tone: "bg-red-50 text-red-600" },
  negativeBalance: { icon: WalletMinimal, tone: "bg-red-50 text-red-600" },
  goalCompleted: { icon: PartyPopper, tone: "bg-emerald-50 text-emerald-600" },
  newUser: { icon: UserPlus, tone: "bg-sky-50 text-sky-600" },
  announcement: { icon: Megaphone, tone: "bg-brand-50 text-brand-600" },
  renewalRequest: { icon: ClipboardCheck, tone: "bg-amber-50 text-amber-600" },
  renewalApproved: { icon: ClipboardCheck, tone: "bg-emerald-50 text-emerald-600" },
  renewalRejected: { icon: ClipboardX, tone: "bg-rose-50 text-rose-600" },
  insufficientBalance: { icon: WalletMinimal, tone: "bg-amber-50 text-amber-600" },
};
const FALLBACK = { icon: Bell, tone: "bg-slate-100 text-slate-600" };

// Header bell for the user app and the admin panel. Polls the server and shows an unread badge.
// Opening it changes nothing: an item becomes read when it's opened (or its dot is pressed),
// or all at once with "mark all as read".
function NotificationBell({ fetchNotifications, markRead, markAllRead, localItems = [], markLocalRead }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loadedAt, setLoadedAt] = useState(0);
  const [status, setStatus] = useState("loading");

  const load = useCallback(async () => {
    try {
      const { data } = await fetchNotifications();
      setItems(data.data.items || []);
      setLoadedAt(Date.now());
      setStatus("ready");
    } catch {
      setStatus((current) => (current === "loading" ? "error" : current));
    }
  }, [fetchNotifications]);

  usePolling(load, POLL_MS);

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

  // Server notifications plus any alerts kept in this browser, newest first.
  const allItems = [...items, ...localItems].sort((a, b) => new Date(b.at) - new Date(a.at));
  const unread = allItems.filter((item) => !item.read).length;

  // Optimistic: flip it locally, then tell the server (reload on failure to stay truthful).
  const readOne = async (item) => {
    if (item.read) return;
    if (item.local) {
      markLocalRead?.([item.id]);
      return;
    }
    setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, read: true } : entry)));
    try {
      await markRead(item.id);
    } catch {
      load();
    }
  };

  const readAll = async () => {
    const localUnread = localItems.filter((item) => !item.read).map((item) => item.id);
    if (localUnread.length) markLocalRead?.(localUnread);
    setItems((current) => current.map((entry) => ({ ...entry, read: true })));
    try {
      await markAllRead();
    } catch {
      load();
    }
  };

  const message = (item) => {
    const params = { ...item.params };
    if (params.amount !== undefined) params.amount = formatMoney(Math.abs(params.amount), params.currency || "EGP");
    if (params.plan) params.plan = t(`admin.home.plans.${params.plan}`, { defaultValue: params.plan });
    if (item.type === "insufficientBalance") {
      return t("notifications.insufficient.message", {
        action: t(`notifications.insufficient.actions.${params.source}`),
        amount: formatMoney(params.amount, params.currency || "EGP"),
        account: params.accountName,
        balance: formatMoney(params.balance, params.currency || "EGP"),
      });
    }
    return t(`notifications.types.${item.type}`, { ...params, defaultValue: item.type });
  };

  const timeAgo = (value) => {
    const seconds = Math.round((new Date(value).getTime() - loadedAt) / 1000);
    const absolute = Math.abs(seconds);
    const rtf = new Intl.RelativeTimeFormat(i18n.language, { numeric: "auto" });
    if (absolute < 60) return rtf.format(0, "second");
    if (absolute < 3600) return rtf.format(Math.round(seconds / 60), "minute");
    if (absolute < 86400) return rtf.format(Math.round(seconds / 3600), "hour");
    if (absolute < 30 * 86400) return rtf.format(Math.round(seconds / 86400), "day");
    return new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" }).format(new Date(value));
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={unread ? t("notifications.titleWithCount", { count: unread }) : t("notifications.title")}
        className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition ${
          open ? "border-brand-200 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800"
        }`}
      >
        <Bell size={19} className={unread ? "origin-top animate-[bell-ring_1.2s_ease-in-out_2]" : ""} />
        {unread > 0 && (
          <span className="absolute -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-expense px-1 text-[10px] font-bold text-white ring-2 ring-white -inset-e-1.5">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t("notifications.title")}
          className="toast-enter absolute top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 inset-e-0"
        >
          <header className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-bold text-slate-900">{t("notifications.title")}</h2>
            {unread > 0 && (
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700">
                  {t("notifications.newCount", { count: unread })}
                </span>
                <button
                  type="button"
                  onClick={readAll}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-brand-700 transition hover:bg-brand-50"
                >
                  <CheckCheck size={14} aria-hidden="true" />
                  {t("notifications.markAllRead")}
                </button>
              </div>
            )}
          </header>

          {status === "loading" ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">{t("common.loading")}</p>
          ) : status === "error" ? (
            <p className="px-4 py-8 text-center text-sm text-expense">{t("notifications.loadError")}</p>
          ) : allItems.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <BellOff size={22} />
              </span>
              <p className="text-sm font-semibold text-slate-700">{t("notifications.emptyTitle")}</p>
              <p className="text-xs text-slate-500">{t("notifications.emptyText")}</p>
            </div>
          ) : (
            <ul className="max-h-[min(26rem,70vh)] divide-y divide-slate-100 overflow-y-auto">
              {allItems.map((item) => {
                const { icon: Icon, tone } = TYPES[item.type] || FALLBACK;
                const fresh = !item.read;
                return (
                  <li key={item.id} className={`relative ${fresh ? "bg-brand-50/50" : ""}`}>
                    <button
                      type="button"
                      onClick={() => {
                        readOne(item);
                        setOpen(false);
                        navigate(item.link);
                      }}
                      className="flex w-full items-start gap-3 py-3 ps-4 pe-10 text-start transition hover:bg-slate-50/80"
                    >
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                        <Icon size={17} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block text-sm leading-5 ${fresh ? "font-semibold text-slate-900" : "text-slate-700"}`}>
                          {message(item)}
                        </span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                          {timeAgo(item.at)}
                          <span aria-hidden="true">·</span>
                          <span className={fresh ? "font-semibold text-brand-600" : ""}>
                            {fresh ? t("notifications.unread") : t("notifications.read")}
                          </span>
                        </span>
                      </span>
                    </button>
                    {/* Unread: a dot that marks just this one as read without leaving the list. */}
                    {fresh && (
                      <button
                        type="button"
                        onClick={() => readOne(item)}
                        title={t("notifications.markRead")}
                        aria-label={t("notifications.markRead")}
                        className="group absolute top-3 flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-brand-100 inset-e-2"
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-brand-500 group-hover:hidden" />
                        <CheckCheck size={14} className="hidden text-brand-700 group-hover:block" />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
