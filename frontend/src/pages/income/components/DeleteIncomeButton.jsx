import { useState } from "react";
import axiosClient from "../../../api/axiosClient";

function getErrorMessage(err, fallback) {
  return err.response?.data?.message || err.message || fallback;
}

export default function DeleteIncomeButton({ incomeId, incomeName, onDeleted }) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setError("");
    try {
      await axiosClient.delete(`/income/${incomeId}`);
      onDeleted?.(incomeId);
      setOpen(false);
    } catch (err) {
      setError(getErrorMessage(err, "تعذر حذف الدخل."));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 active:bg-rose-100 transition-colors"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path
            fillRule="evenodd"
            d="M8.75 1A1.75 1.75 0 0 0 7 2.75V3H4a.75.75 0 0 0 0 1.5h.5v10.75A2.75 2.75 0 0 0 7.25 18h5.5a2.75 2.75 0 0 0 2.75-2.75V4.5h.5a.75.75 0 0 0 0-1.5h-3v-.25A1.75 1.75 0 0 0 11.25 1h-2.5ZM8.5 2.75a.25.25 0 0 1 .25-.25h2.5a.25.25 0 0 1 .25.25V3h-3v-.25ZM6 4.5h8v10.75c0 .69-.56 1.25-1.25 1.25h-5.5c-.69 0-1.25-.56-1.25-1.25V4.5Z"
            clipRule="evenodd"
          />
        </svg>
        Delete
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={() => !deleting && setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-slate-900">هل أنت متأكد؟</h2>
            <p className="mt-2 text-sm text-slate-600">
              هيتم حذف{" "}
              <span className="font-medium text-slate-800">"{incomeName}"</span> نهائيًا.
              {" "}لو الدخل ده متكرر، هيتوقف من كل الفترات الجاية.
            </p>

            {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={deleting}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-rose-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {deleting ? "جاري الحذف..." : "تأكيد الحذف"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
