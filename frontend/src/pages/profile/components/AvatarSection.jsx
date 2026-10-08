import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Camera, Trash2 } from "lucide-react";
import { uploadAvatar, deleteAvatar } from "../../../store/slices/authSlice";

const errorClass = "rounded-xl bg-expense-soft px-4 py-2.5 text-sm font-medium text-expense";

function AvatarSection({ user, t }) {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  const initial = user?.name?.trim()?.[0]?.toUpperCase() || "?";

  const handlePickPhoto = () => fileInputRef.current?.click();

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setAvatarError("");
    const reader = new FileReader();
    reader.onload = async () => {
      setAvatarBusy(true);
      const result = await dispatch(uploadAvatar(reader.result));
      if (!uploadAvatar.fulfilled.match(result)) {
        setAvatarError(result.payload || t("profile.avatarError"));
      }
      setAvatarBusy(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    setAvatarError("");
    setAvatarBusy(true);
    const result = await dispatch(deleteAvatar());
    if (!deleteAvatar.fulfilled.match(result)) {
      setAvatarError(result.payload || t("profile.avatarError"));
    }
    setAvatarBusy(false);
  };

  return (
    <section className="mt-6 flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm sm:flex-row sm:p-6 sm:text-start">
      <div className="relative shrink-0">
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="h-20 w-20 rounded-full object-cover ring-4 ring-slate-100"
          />
        ) : (
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 text-2xl font-bold text-white ring-4 ring-slate-100">
            {initial}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-lg font-bold text-slate-900">{user?.name}</p>
        <p className="truncate text-sm text-slate-500">{user?.email}</p>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={handlePhotoChange}
          />
          <button
            type="button"
            onClick={handlePickPhoto}
            disabled={avatarBusy}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/15 disabled:opacity-60"
          >
            <Camera size={15} />
            {t("profile.changePhoto")}
          </button>
          {user?.avatar && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              disabled={avatarBusy}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:border-expense hover:bg-expense-soft/40 hover:text-expense focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-expense/15 disabled:opacity-60"
            >
              <Trash2 size={15} />
              {t("profile.removePhoto")}
            </button>
          )}
        </div>

        {avatarError && <p className={`mt-2 ${errorClass}`}>{avatarError}</p>}
      </div>
    </section>
  );
}

export default AvatarSection;
