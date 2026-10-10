import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Camera, ShieldCheck, Trash2 } from "lucide-react";
import { deleteAdminPhoto, uploadAdminPhoto } from "../../../api/adminSettingsApi";
import { setAdminProfile } from "../../../store/slices/adminAuthSlice";
import { errorClass, requestError } from "./styles";

// Who's signed in: cover, photo (change / remove), name, email and role.
function AdminProfileCard({ admin, t }) {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const initial = (admin?.name || admin?.email || "?").trim()[0]?.toUpperCase();

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    const reader = new FileReader();
    reader.onload = async () => {
      setBusy(true);
      try {
        const { data } = await uploadAdminPhoto(reader.result);
        dispatch(setAdminProfile(data.data));
      } catch (uploadError) {
        setError(requestError(uploadError, t("profile.avatarError")));
      }
      setBusy(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    setError("");
    setBusy(true);
    try {
      const { data } = await deleteAdminPhoto();
      dispatch(setAdminProfile(data.data));
    } catch (removeError) {
      setError(requestError(removeError, t("profile.avatarError")));
    }
    setBusy(false);
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
      <div className="relative h-24 bg-linear-to-br from-navy-800 to-navy-900">
        <span aria-hidden="true" className="absolute -top-10 h-32 w-32 rounded-full bg-brand-500/25 blur-2xl inset-e-4" />
      </div>
      <div className="-mt-12 flex flex-col items-center px-5 pb-5 text-center">
        <div className="relative">
          {admin?.avatar ? (
            <img src={admin.avatar} alt={admin.name} className="h-24 w-24 rounded-full object-cover ring-4 ring-white" />
          ) : (
            <span className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-600 text-3xl font-bold text-white ring-4 ring-white">
              {initial}
            </span>
          )}
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handlePhotoChange} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            aria-label={t("profile.changePhoto")}
            title={t("profile.changePhoto")}
            className="absolute bottom-0 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-md ring-1 ring-slate-200 transition hover:text-brand-700 disabled:opacity-60 inset-e-0"
          >
            <Camera size={16} />
          </button>
        </div>

        <p className="mt-3 max-w-full truncate text-lg font-bold text-slate-900">{admin?.name}</p>
        <p className="max-w-full truncate text-sm text-slate-500" dir="ltr">{admin?.email}</p>
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
          <ShieldCheck size={13} />
          {t("admin.settings.role")}
        </span>

        {admin?.avatar && (
          <button
            type="button"
            onClick={handleRemovePhoto}
            disabled={busy}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 transition hover:bg-expense-soft hover:text-expense disabled:opacity-60"
          >
            <Trash2 size={13} />
            {t("profile.removePhoto")}
          </button>
        )}
        {error && <p className={`mt-3 w-full ${errorClass}`}>{error}</p>}
      </div>
    </section>
  );
}

export default AdminProfileCard;
