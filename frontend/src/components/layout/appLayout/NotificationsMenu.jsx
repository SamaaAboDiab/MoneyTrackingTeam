import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Bell, Clock, Wallet } from "lucide-react";
import { fetchDebts } from "../../../store/slices/debtsSlice";
import { notificationsLoaded, notificationsRead } from "../../../store/slices/notificationsSlice";
import { getDaysUntilDue, isDueSoon, isOverdue } from "../../../pages/debts/utils";
import { formatDateTime, formatMoney } from "../../../utils/formatAmount";
import useDismiss from "./useDismiss";

const STORAGE_PREFIX = "appNotifications:";
const MAX_READ_IDS = 200;

// Mali flags alerts in its orange accent (navy text on orange for contrast); emerald keeps red.
const ALERT_TONE = "bg-accent-50 text-accent-700 emerald:bg-expense-soft emerald:text-expense";

function readStored(ownerId) {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_PREFIX + ownerId)) || {};
  } catch {
    return {};
  }
}

// Debt alerts are derived from the current debts list on every render, not stored.
function debtAlerts(debts) {
  const alerts = [];
  for (const debt of debts) {
    const data = {
      creditor: debt.creditor,
      remaining: debt.remainingAmount ?? Math.max(0, debt.totalAmount - debt.paidAmount),
      currency: debt.currency,
    };
    if (isOverdue(debt)) {
      alerts.push({ id: `debt-overdue-${debt._id}`, type: "debtOverdue", to: "/debts", data });
    } else if (isDueSoon(debt)) {
      // Keyed by due date so moving the date brings the alert back as unread.
      alerts.push({
        id: `debt-due-${debt._id}-${String(debt.dueDate).slice(0, 10)}`,
        type: "debtDueSoon",
        to: "/debts",
        data: { ...data, days: getDaysUntilDue(debt.dueDate) },
      });
    }
  }
  // Overdue first, then the nearest due dates.
  return alerts.sort((a, b) =>
    a.type === b.type ? (a.data.days ?? 0) - (b.data.days ?? 0) : a.type === "debtOverdue" ? -1 : 1
  );
}

function describe(notification, t) {
  const { type, data } = notification;
  if (type === "debtOverdue") {
    return {
      Icon: AlertTriangle,
      tone: ALERT_TONE,
      title: t("notifications.debtOverdue.title"),
      message: t("notifications.debtOverdue.message", {
        creditor: data.creditor,
        amount: formatMoney(data.remaining, data.currency),
      }),
    };
  }
  if (type === "debtDueSoon") {
    const when =
      data.days === 0
        ? t("notifications.debtDueSoon.today")
        : data.days === 1
          ? t("notifications.debtDueSoon.tomorrow")
          : t("notifications.debtDueSoon.inDays", { count: data.days });
    return {
      Icon: Clock,
      tone: "bg-amber-100 text-amber-700",
      title: t("notifications.debtDueSoon.title"),
      message: t("notifications.debtDueSoon.message", {
        creditor: data.creditor,
        when,
        amount: formatMoney(data.remaining, data.currency),
      }),
    };
  }
  return {
    Icon: Wallet,
    tone: ALERT_TONE,
    title: t("notifications.insufficient.title"),
    message: t("notifications.insufficient.message", {
      action: t(`notifications.insufficient.actions.${data.source}`),
      amount: formatMoney(data.amount, data.currency),
      account: data.accountName,
      balance: formatMoney(data.balance, data.currency),
    }),
  };
}

const EVENT_LINKS = { transfer: "/accounts/transfer", cash: "/cash", expense: "/expenses", debtPayment: "/debts", savings: "/savings" };

// Navbar bell: debt alerts (overdue / due within 7 days) and insufficient-balance attempts.
function NotificationsMenu({ user, t }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: debts, status: debtsStatus } = useSelector((state) => state.debts);
  const { ownerId, events, readIds } = useSelector((state) => state.notifications);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(containerRef, open, close);

  const userId = user?._id || user?.id || user?.email;

  // Load this user's saved notifications; save them back whenever they change.
  useEffect(() => {
    if (!userId) return;
    const stored = readStored(userId);
    dispatch(notificationsLoaded({ ownerId: userId, events: stored.events, readIds: stored.readIds }));
  }, [dispatch, userId]);

  useEffect(() => {
    if (!userId || ownerId !== userId) return;
    try {
      localStorage.setItem(
        STORAGE_PREFIX + userId,
        JSON.stringify({ events, readIds: readIds.slice(-MAX_READ_IDS) })
      );
    } catch {
      // Storage blocked: notifications still work for this visit.
    }
  }, [userId, ownerId, events, readIds]);

  useEffect(() => {
    if (debtsStatus === "idle") dispatch(fetchDebts());
  }, [dispatch, debtsStatus]);

  const notifications = useMemo(() => {
    const read = new Set(readIds);
    const events_ = events.map((event) => ({ ...event, to: EVENT_LINKS[event.data.source] }));
    return [...debtAlerts(debts), ...events_].map((n) => ({ ...n, unread: !read.has(n.id) }));
  }, [debts, events, readIds]);
  const unreadCount = notifications.filter((n) => n.unread).length;

  const openNotification = (notification) => {
    dispatch(notificationsRead([notification.id]));
    close();
    if (notification.to) navigate(notification.to);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={t("notifications.title")}
        title={t("notifications.title")}
        className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 sm:h-10 sm:w-10"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -end-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[11px] font-bold text-navy ring-2 ring-white emerald:bg-expense emerald:text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
            <span className="sr-only"> {t("notifications.unread", { count: unreadCount })}</span>
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full z-40 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-slate-100 bg-white shadow-xl inset-e-0">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-bold text-slate-900">{t("notifications.title")}</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => dispatch(notificationsRead(notifications.map((n) => n.id)))}
                className="text-xs font-semibold text-brand-700 hover:underline"
              >
                {t("notifications.markAllRead")}
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">{t("notifications.empty")}</p>
          ) : (
            <ul className="max-h-96 overflow-y-auto p-1.5">
              {notifications.map((notification) => {
                const { Icon, tone, title, message } = describe(notification, t);
                return (
                  <li key={notification.id}>
                    <button
                      type="button"
                      onClick={() => openNotification(notification)}
                      className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-start transition hover:bg-slate-50 ${
                        notification.unread ? "bg-slate-50/70" : ""
                      }`}
                    >
                      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone}`}>
                        <Icon size={16} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className={`text-sm text-slate-900 ${notification.unread ? "font-bold" : "font-semibold"}`}>
                            {title}
                          </span>
                          {notification.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-brand-600" aria-hidden="true" />}
                        </span>
                        <span className="mt-0.5 block text-xs leading-5 text-slate-500">{message}</span>
                        {notification.createdAt && (
                          <span className="mt-1 block text-[11px] text-slate-400">{formatDateTime(notification.createdAt)}</span>
                        )}
                      </span>
                    </button>
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

export default NotificationsMenu;
