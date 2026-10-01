import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { listCategories, createCategory, updateCategory, deleteCategory } from "../../../api/categoryApi";
import { MANDATORY_CATEGORIES } from "./mandatoryCategories";
import { extractError } from "../../../utils/errorHandler";

import CategoryList from "./manager/CategoryList";
import CategoryFormModal from "./manager/CategoryFormModal";
import DeleteCategoryModal from "./manager/DeleteCategoryModal";
import PageHeader from "../../../components/common/PageHeader";
import { Tags } from "lucide-react";
const DEFAULT_COLOR = "#6b7280";

// labels come from categoriesPage.type.* in the active language
const TYPE_OPTIONS = [
  { value: "daily",     pill: "bg-red-100 text-red-700" },
  { value: "fixed",     pill: "bg-yellow-100 text-yellow-700" },
  { value: "emergency", pill: "bg-slate-200 text-slate-600" },
];


export default function CategoryManager() {
  const { t } = useTranslation();
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
      setError(extractError(err, t("categoriesPage.loadError")));
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
      setFormError(t("categoriesPage.nameRequired"));
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
        flashSuccess(t("categoriesPage.updateSuccess"));
      } else {
        // Fix #2 — بنبعت type في الـ create
        const created = await createCategory({ name: name.trim(), type, color });
        setCategories((prev) => [...prev, created]);
        flashSuccess(t("categoriesPage.createSuccess"));
      }
      closeForm();
    } catch (err) {
      // Fix #8 — رسالة الخطأ الصح من الـ backend
      setFormError(extractError(err, t("categoriesPage.saveError")));
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
      flashSuccess(t("categoriesPage.deleteSuccess"));
    } catch (err) {
      // Fix #8 — رسالة الخطأ الصح
      setError(extractError(err, t("categoriesPage.deleteError")));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const typeOptions = TYPE_OPTIONS.map((o) => ({ ...o, label: t(`categoriesPage.type.${o.value}`) }));
  const typeInfo = (value) => typeOptions.find((o) => o.value === value) || typeOptions[0];

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        icon={Tags}
        title={t("categoriesPage.title")}
        actions={
          <button type="button" onClick={openAddForm} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-brand-600/25 transition hover:bg-brand-700">
            {t("categoriesPage.addNew")}
          </button>
        }
      />

      {successMsg && (
        <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</div>
      )}

      <CategoryList
        categories={categories}
        loading={loading}
        openEditForm={openEditForm}
        setDeleteTarget={setDeleteTarget}
        MANDATORY_CATEGORIES={MANDATORY_CATEGORIES}
        typeInfo={typeInfo}
      />

      <CategoryFormModal
        formOpen={formOpen}
        closeForm={closeForm}
        handleSave={handleSave}
        editingId={editingId}
        editingCat={editingCat}
        name={name}
        setName={setName}
        type={type}
        setType={setType}
        color={color}
        setColor={setColor}
        formError={formError}
        saving={saving}
        TYPE_OPTIONS={typeOptions}
      />

      <DeleteCategoryModal
        deleteTarget={deleteTarget}
        setDeleteTarget={setDeleteTarget}
        deleting={deleting}
        handleDelete={handleDelete}
      />
    </div>
  );
}
