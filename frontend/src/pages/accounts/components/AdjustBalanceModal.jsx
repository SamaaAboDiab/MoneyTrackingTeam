import { useState } from "react";
export default function AdjustBalanceButton({ account, onSubmit, onUpdated }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("form"); // "form" | "confirm"
  const [newBalance, setNewBalance] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const currency = account?.currency || "EGP";

  function resetAndClose() {
    setOpen(false);
    setStep("form");
    setNewBalance("");
    setNotes("");
    setError("");
    setSaving(false);
  }

  function handleContinue(e) {
    e.preventDefault();
    setError("");

    if (newBalance.trim() === "" || isNaN(Number(newBalance))) {
      setError("من فضلك أدخل رصيد صحيح.");
      return;
    }
    if (Number(newBalance) === account.balance) {
      setError("الرصيد الجديد مطابق للرصيد الحالي.");
      return;
    }
    setStep("confirm");
  }

  async function handleConfirm() {
    setSaving(true);
    setError("");
    try {
      const updatedAccount = await onSubmit({
        accountId: account._id,
        newBalance: Number(newBalance),
        notes: notes.trim() || undefined,
      });
      onUpdated?.(updatedAccount);
      resetAndClose();
    } catch (err) {
      setError(typeof err === "string" ? err : err.message || "حصل خطأ أثناء حفظ التعديل.");
      setSaving(false);
    }
  }

  const diff = Number(newBalance) - (account?.balance ?? 0);
  const diffLabel =
    !isNaN(diff) && diff !== 0
      ? `${diff > 0 ? "+" : ""}${diff.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
      : "";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 w-[150px] rounded-lg border border-slate-200 px-3 py-1.5 text-base font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-slate-500">
          <path d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-8.5 8.5a2 2 0 0 1-.878.507l-3 .8a.5.5 0 0 1-.612-.612l.8-3a2 2 0 0 1 .507-.878l8.5-8.5Z" />
        </svg>
        تعديل الرصيد
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={resetAndClose}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            {step === "form" && (
              <form onSubmit={handleContinue}>
                <h2 className="text-base font-semibold text-slate-900">
                  تعديل رصيد {account?.name}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  الرصيد الحالي:{" "}
                  <span className="font-medium text-slate-700">
                    {account?.balance?.toLocaleString(undefined, { maximumFractionDigits: 2 })} {currency}
                  </span>
                </p>

                <label className="mt-4 block text-sm font-medium text-slate-700">
                  الرصيد الجديد
                </label>
                <input
                  type="number"
                  step="any"
                  autoFocus
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  placeholder="0.00"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />

                <label className="mt-3 block text-sm font-medium text-slate-700">
                  ملاحظة (اختياري)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="سبب التعديل..."
                  rows={2}
                  className="mt-1 w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                />

                {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}

                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={resetAndClose}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-teal-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-teal-800"
                  >
                    متابعة
                  </button>
                </div>
              </form>
            )}

            {step === "confirm" && (
              <div>
                <h2 className="text-base font-semibold text-slate-900">تأكيد التعديل</h2>
                <p className="mt-1 text-sm text-slate-500">
                  هل أنت متأكد من تعديل رصيد "{account?.name}"؟
                </p>

                <div className="mt-4 rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">الرصيد الحالي</span>
                    <span className="font-medium text-slate-700">
                      {account?.balance?.toLocaleString(undefined, { maximumFractionDigits: 2 })} {currency}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-slate-500">الرصيد الجديد</span>
                    <span className="font-semibold text-teal-700">
                      {Number(newBalance).toLocaleString(undefined, { maximumFractionDigits: 2 })} {currency}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2 text-sm">
                    <span className="text-slate-500">الفرق</span>
                    <span className={diff >= 0 ? "font-medium text-emerald-600" : "font-medium text-rose-600"}>
                      {diffLabel} {currency}
                    </span>
                  </div>
                  {notes.trim() && (
                    <div className="mt-2 border-t border-slate-200 pt-2 text-sm text-slate-600">
                      <span className="text-slate-500">ملاحظة: </span>
                      {notes.trim()}
                    </div>
                  )}
                </div>

                {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}

                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setStep("form")}
                    disabled={saving}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                  >
                    رجوع
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={saving}
                    className="rounded-lg bg-teal-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
                  >
                    {saving ? "جاري الحفظ..." : "تأكيد الحفظ"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
