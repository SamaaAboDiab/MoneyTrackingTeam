import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile, clearProfileError } from "../../../store/slices/authSlice";
import { localizeDigits, normalizeDigits } from "../../../utils/formatAmount";

const inputClass =
  "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500";
const labelClass = "text-sm font-semibold text-slate-700";
const errorClass = "rounded-xl bg-expense-soft px-4 py-2.5 text-sm font-medium text-expense";
const successClass = "rounded-xl bg-income-soft px-4 py-2.5 text-sm font-medium text-income";

function ProfileForm({ user, t }) {
  const dispatch = useDispatch();
  const { profileStatus, profileError } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [saved, setSaved] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    // Phone digits are stored as Western digits whatever keyboard the user typed them with.
    setForm((prev) => ({ ...prev, [name]: name === "phone" ? normalizeDigits(value) : value }));
    setSaved(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    dispatch(clearProfileError());
    setSaved(false);

    const result = await dispatch(updateProfile({ name: form.name.trim(), phone: form.phone.trim() }));
    if (updateProfile.fulfilled.match(result)) setSaved(true);
  };

  return (
    <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100">
      <h2 className="text-lg font-bold text-slate-900">{t("profile.editTitle")}</h2>

      <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className={labelClass}>
            {t("profile.nameLabel")}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className={labelClass}>
            {t("profile.phoneLabel")}
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={localizeDigits(form.phone)}
            onChange={handleChange}
            placeholder={t("profile.phonePlaceholder")}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="profile-email" className={labelClass}>{t("profile.emailLabel")}</label>
          <input
            id="profile-email"
            type="email"
            dir="ltr"
            value={user?.email || ""}
            disabled
            className={`${inputClass} cursor-not-allowed bg-slate-50 text-slate-400`}
          />
        </div>

        <div className="flex flex-col justify-end gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
          {profileError && <p className={errorClass}>{profileError}</p>}
          {saved && <p className={successClass}>{t("profile.saveSuccess")}</p>}
          <button
            type="submit"
            disabled={profileStatus === "loading"}
            className="ms-auto rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-65"
          >
            {profileStatus === "loading" ? t("profile.saving") : t("profile.save")}
          </button>
        </div>
      </form>
    </section>
  );
}

export default ProfileForm;
