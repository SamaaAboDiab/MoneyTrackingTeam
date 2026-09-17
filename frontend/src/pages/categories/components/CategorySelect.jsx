import { useEffect, useState } from "react";
import { listCategories, createCategory } from "../../../api/categoryApi";

const ADD_NEW_VALUE = "__add_new__";
const DEFAULT_COLOR = "#6b7280";

export default function CategorySelect({ value, onChange }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(DEFAULT_COLOR);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleSelectChange(e) {
    if (e.target.value === ADD_NEW_VALUE) {
      setAdding(true);
      return;
    }
    onChange?.(e.target.value);
  }

  async function handleCreate(e) {
  e.preventDefault();
  if (!newName.trim()) {
    setError("اسم التصنيف مطلوب.");
    return;
  }
  setSaving(true);
  setError("");
  try {
    const created = await createCategory({ name: newName.trim(), color: newColor });
    setCategories((prev) => [...prev, created]);
    onChange?.(created._id);
    setAdding(false);
    setNewName("");
    setNewColor(DEFAULT_COLOR);
  } catch (err) {
    setError(err.message || "تعذر إضافة التصنيف.");
  } finally {
    setSaving(false);
  }
}

  if (adding) {
  return (
    <div className="rounded-lg border border-slate-200 p-3" dir="rtl">
      <label className="block text-sm font-medium text-slate-700">اسم التصنيف الجديد</label>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="text"
          autoFocus
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleCreate(e);
            }
          }}
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
        />
        <input
          type="color"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          className="h-9 w-10 rounded-lg border border-slate-300"
        />
      </div>
      {error && <p className="mt-1 text-sm text-rose-600">{error}</p>}
      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setAdding(false)}
          className="rounded-lg px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          إلغاء
        </button>
        <button
          type="button"
          onClick={handleCreate}
          disabled={saving}
          className="rounded-lg bg-teal-700 px-3 py-1 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
        >
          {saving ? "جاري الإضافة..." : "إضافة"}
        </button>
      </div>
    </div>
  );

  }

  return (
    <select
      value={value || ""}
      onChange={handleSelectChange}
      disabled={loading}
      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
    >
      <option value="" disabled>
        {loading ? "جاري التحميل..." : "اختر تصنيف"}
      </option>
      {categories.map((cat) => (
        <option key={cat._id} value={cat._id}>
          {cat.name}
        </option>
      ))}

      <option value={ADD_NEW_VALUE}>نوع آخر</option>
    </select>
  );
}
