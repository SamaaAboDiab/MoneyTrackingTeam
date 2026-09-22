import { useEffect, useState } from "react";
import { listCategories, createCategory, updateCategory, deleteCategory } from "../../../api/categoryApi";
import { MANDATORY_CATEGORIES } from "./mandatoryCategories";

const DEFAULT_COLOR = "#6b7280";

const TYPE_OPTIONS = [
  { value: "daily",     label: "يومي",        pill: "bg-red-100 text-red-700" },
  { value: "fixed",     label: "شهري ثابت",   pill: "bg-yellow-100 text-yellow-700" },
  { value: "emergency", label: "طارئ",         pill: "bg-slate-200 text-slate-600" },
];

// استخراج رسالة الخطأ من الـ axios response
function extractErrMsg(err, fallback = "حصل خطأ.") {
  return err?.response?.data?.message || err?.message || fallback;
}

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");

  // form state
  const [formOpen,   setFormOpen]   = useState(false);
  const [editingId,  setEditingId]  = useState(null);
  const [editingCat, setEditingCat] = useState(null); // الـ object الكامل
  const [name,       setName]       = useState("");
  const [type,       setType]       = useState("daily");
  const [color,      setColor]      = useState(DEFAULT_COLOR);
  const [saving,     setSaving]     = useState(false);
  const [formError,  setFormError]  = useState("");

  // delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);

  // toast
  const [successMsg, setSuccessMsg] = useState("");

  async function loadCategories() {
    setLoading(true);
    setError("");
    try {
      const data = await listCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(extractErrMsg(err, "تعذر تحميل التصنيفات."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const id = setTimeout(() => loadCategories(), 0);
    return () => clearTimeout(id);
  }, []);

  function openAddForm() {
    setEditingId(null);
    setEditingCat(null);
    setName("");
    setType("daily");
    setColor(DEFAULT_COLOR);
    setFormError("");
    setFormOpen(true);
  }

  function openEditForm(cat) {
    setEditingId(cat._id);
    setEditingCat(cat);
    setName(cat.name);
    setType(cat.type || "daily");
    setColor(cat.color || DEFAULT_COLOR);
    setFormError("");
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setEditingCat(null);
    setFormError("");
  }

  function flashSuccess(msg) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("اسم التصنيف مطلوب.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      if (editingId) {
        // Fix #3 — بنبعت type في الـ update
        const updated = await updateCategory(editingId, {
          name:  name.trim(),
          type,
          color,
        });
        setCategories((prev) => prev.map((c) => (c._id === editingId ? updated : c)));
        flashSuccess("تم التعديل بنجاح");
      } else {
        // Fix #2 — بنبعت type في الـ create
        const created = await createCategory({ name: name.trim(), type, color });
        setCategories((prev) => [...prev, created]);
        flashSuccess("تم إضافة التصنيف بنجاح");
      }
      closeForm();
    } catch (err) {
      // Fix #8 — رسالة الخطأ الصح من الـ backend
      setFormError(extractErrMsg(err, "حصل خطأ أثناء الحفظ."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCategory(deleteTarget._id);
      setCategories((prev) => prev.filter((c) => c._id !== deleteTarget._id));
      setDeleteTarget(null);
      flashSuccess("تم حذف التصنيف");
    } catch (err) {
      // Fix #8 — رسالة الخطأ الصح
      setError(extractErrMsg(err, "تعذر حذف التصنيف."));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const typeInfo = (t) => TYPE_OPTIONS.find((o) => o.value === t) || TYPE_OPTIONS[0];

  return (
    <div className="mx-auto max-w-lg p-4" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">التصنيفات</h1>
        <button
          type="button"
          onClick={openAddForm}
          className="rounded-lg bg-teal-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-800"
        >
          + إضافة تصنيف جديد
        </button>
      </div>

      {successMsg && (
        <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</div>
      )}

      <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">
        {loading ? (
          <p className="p-4 text-sm text-slate-500">جاري التحميل...</p>
        ) : categories.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">مفيش تصنيفات لسة.</p>
        ) : (
          categories.map((cat) => (
            <div key={cat._id} className="flex items-center justify-between p-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-slate-800">{cat.name}</span>
                {/* نوع التصنيف */}
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeInfo(cat.type).pill}`}>
                  {typeInfo(cat.type).label}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Fix #7 — زرار التعديل متاح للكل لكن الـ backend هيمنع تغيير الاسم/النوع للـ defaults */}
                <button
                  type="button"
                  onClick={() => openEditForm(cat)}
                  className="text-sm font-medium text-teal-700 hover:underline"
                >
                  تعديل
                </button>
                {/* زرار الحذف مخفي تماماً للتصنيفات الإلزامية */}
                {!cat.isDefault && !MANDATORY_CATEGORIES.includes(cat.name) && (
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(cat)}
                    className="text-sm font-medium text-rose-600 hover:underline"
                  >
                    حذف
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit modal */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={closeForm}
        >
          <form
            onSubmit={handleSave}
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-slate-900">
              {editingId ? "تعديل التصنيف" : "تصنيف جديد"}
            </h2>

            {/* اسم التصنيف — معطّل للـ defaults */}
            <label className="mt-4 block text-sm font-medium text-slate-700">الاسم</label>
            <input
              type="text"
              autoFocus
              placeholder="مثال: صيانة، اشتراكات شهرية، هدايا..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={editingCat?.isDefault}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 disabled:bg-slate-50 disabled:text-slate-400"
            />
            {editingCat?.isDefault && (
              <p className="mt-1 text-xs text-slate-400">اسم التصنيف الافتراضي لا يمكن تغييره</p>
            )}

            {/* نوع التصنيف — Fix #2 & #3 — معطّل للـ defaults */}
            <label className="mt-3 block text-sm font-medium text-slate-700">النوع</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={editingCat?.isDefault}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600 disabled:bg-slate-50 disabled:text-slate-400"
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {editingCat?.isDefault && (
              <p className="mt-1 text-xs text-slate-400">نوع التصنيف الافتراضي لا يمكن تغييره</p>
            )}

            {/* اللون — متاح للكل حتى الـ defaults */}
            <label className="mt-3 block text-sm font-medium text-slate-700">اللون</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="mt-1 h-9 w-16 rounded-lg border border-slate-300"
            />

            {formError && <p className="mt-2 text-sm text-rose-600">{formError}</p>}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-teal-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
              >
                {saving ? "جاري الحفظ..." : "حفظ"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-slate-900">هل أنت متأكد؟</h2>
            <p className="mt-2 text-sm text-slate-600">
              هيتم حذف تصنيف &quot;{deleteTarget.name}&quot; نهائيًا.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
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
    </div>
  );
}
