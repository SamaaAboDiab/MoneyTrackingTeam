import { useEffect, useState } from "react";
import { listCategories, createCategory, updateCategory, deleteCategory } from "../../../api/categoryApi";

const DEFAULT_COLOR = "#6b7280";
export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // add/edit form state
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = adding new
  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState(null); // category object
  const [deleting, setDeleting] = useState(false);

  // success toast
  const [successMsg, setSuccessMsg] = useState("");

  async function loadCategories() {
  setLoading(true);
  setError("");
  try {
    const data = await listCategories();
    setCategories(data);
  } catch (err) {
    setError(err.message || "تعذر تحميل التصنيفات.");
  } finally {
    setLoading(false);
  }
}

useEffect(() => {
  (async () => {
    await loadCategories();
  })();
}, []);

  function openAddForm() {
    setEditingId(null);
    setName("");
    setColor(DEFAULT_COLOR);
    setFormError("");
    setFormOpen(true);
  }

  function openEditForm(cat) {
    setEditingId(cat._id);
    setName(cat.name);
    setColor(cat.color || DEFAULT_COLOR);
    setFormError("");
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
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
        const updated = await updateCategory(editingId, { name: name.trim(), color });
        setCategories((prev) => prev.map((c) => (c._id === editingId ? updated : c)));
        flashSuccess("تم التعديل بنجاح");
      } else {
        const created = await createCategory({ name: name.trim(), color });
        setCategories((prev) => [...prev, created]);
        flashSuccess("تم إضافة التصنيف بنجاح");
      }
      closeForm();
    } catch (err) {
      setFormError(err.message || "حصل خطأ أثناء الحفظ.");
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
      setError(err.message || "تعذر حذف التصنيف.");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

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
              <div className="flex items-center gap-2">
                <span
                  className="h-3.5 w-3.5 rounded-full"
                  style={{ backgroundColor: cat.color || DEFAULT_COLOR }}
                />
                <span className="text-sm font-medium text-slate-800">{cat.name}</span>
                {cat.isDefault && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                    افتراضي
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditForm(cat)}
                  className="text-sm font-medium text-teal-700 hover:underline"
                >
                  تعديل
                </button>
                {!cat.isDefault && (
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

            <label className="mt-4 block text-sm font-medium text-slate-700">الاسم</label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />

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
              هيتم حذف تصنيف "{deleteTarget.name}" نهائيًا.
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
