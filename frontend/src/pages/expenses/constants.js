export const EMPTY_FORM = {
  description: "",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  paymentMethod: "cash",
  expenseType: "",
  category: "",
  accountId: "",
  notes: "",
};

export const EMPTY_FILTERS = {
  period: "all",
  startDate: "",
  endDate: "",
  type: "all",
  category: "all",
  account: "all",
};

export const TYPE_STYLES = {
  daily: { label: "يومي", pill: "bg-red-100 text-red-700" },
  fixed: { label: "شهري ثابت", pill: "bg-yellow-100 text-yellow-700" },
  emergency: { label: "طارئ", pill: "bg-slate-200 text-slate-700" },
};

export const FALLBACK_CATEGORY_COLORS = {
  "أكل": "#f97316",
  "مواصلات": "#3b82f6",
  "إيجار": "#f59e0b",
  "فواتير": "#8b5cf6",
  "صحة": "#10b981",
  "تعليم": "#0ea5e9",
  "تسلية": "#ec4899",
  "غيره": "#6b7280",
};

export const inputClass =
  "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500 bg-white";
export const labelClass = "text-sm font-semibold text-slate-700";

export function formatMoney(value) {
  const num = Number(value || 0);
  return new Intl.NumberFormat("ar-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}
