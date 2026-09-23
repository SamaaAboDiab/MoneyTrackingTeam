import { Link } from "react-router-dom";
import { CreditCard, AlertCircle, CheckCircle2, ChevronLeft } from "lucide-react";
import { formatAmount } from "../../../utils/formatAmount";

function getDaysUntilDue(dateString) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dateString);
  dueDate.setHours(0, 0, 0, 0);
  return Math.ceil((dueDate - today) / 86400000);
}

function getDueSoonMessage(days) {
  if (days === 0) return "موعد السداد اليوم";
  if (days === 1) return "موعد السداد غداً";
  return `موعد السداد بعد ${days} أيام`;
}

function DashboardDebtsCard({ debts = [], status = "idle" }) {
  const activeDebts = debts.filter(
    (d) => d.status === "active" || d.status === "overdue"
  );

  const totalRemaining = activeDebts.reduce(
    (sum, d) => sum + Math.max(0, Number(d.totalAmount) - Number(d.paidAmount || 0)),
    0
  );

  const overdueDebts = debts.filter((d) => {
    if (d.status === "paid") return false;
    if (d.status === "overdue") return true;
    if (!d.dueDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(d.dueDate) < today;
  });

  const dueSoonDebts = debts.filter((d) => {
    if (d.status === "paid" || overdueDebts.includes(d) || !d.dueDate) return false;
    const daysUntilDue = getDaysUntilDue(d.dueDate);
    return daysUntilDue >= 0 && daysUntilDue <= 7;
  });

  const currency = debts[0]?.currency || "EGP";

  return (
    <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <CreditCard size={20} />
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900">إجمالي الديون المستحقة</h2>
            <p className="text-xs text-slate-500">
              {activeDebts.length > 0
                ? `${activeDebts.length} دين نشط يتطلب السداد`
                : "لا توجد ديون مستحقة عليك حالياً 🎉"}
            </p>
          </div>
        </div>

        <Link
          to="/debts"
          className="flex items-center gap-1 text-sm font-semibold text-brand-600 transition hover:text-brand-700 hover:underline"
        >
          <span>إدارة الديون</span>
          <ChevronLeft size={16} className="rtl:rotate-180" />
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">المبلغ المتبقي للسداد</p>
          <p className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            {status === "loading" ? (
              <span className="text-slate-400 text-lg">جارٍ الحساب...</span>
            ) : (
              <>
                {formatAmount(totalRemaining)}{" "}
                <span className="text-base font-bold text-slate-600">{currency}</span>
              </>
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {overdueDebts.length > 0 && (
            <span className="flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
              <AlertCircle size={14} />
              {overdueDebts.length} ديون متأخرة!
            </span>
          )}

          {dueSoonDebts.length > 0 && (
            <span className="flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
              <AlertCircle size={14} />
              {dueSoonDebts.length} ديون موعدها قريب
            </span>
          )}

          {activeDebts.length === 0 ? (
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 size={14} />
              كل الديون مسددة بالكامل
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              {activeDebts.length} ديون نشطة
            </span>
          )}
        </div>
      </div>

      {dueSoonDebts.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {dueSoonDebts.map((debt) => (
            <span key={debt._id} className="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700">
              {debt.creditor}: {getDueSoonMessage(getDaysUntilDue(debt.dueDate))}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default DashboardDebtsCard;
