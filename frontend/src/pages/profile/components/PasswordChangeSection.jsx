import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changePassword, resetPasswordChangeState } from "../../../store/slices/authSlice";

const inputClass =
  "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500";
const labelClass = "text-sm font-semibold text-slate-700";
const errorClass = "rounded-xl bg-expense-soft px-4 py-2.5 text-sm font-medium text-expense";
const successClass = "rounded-xl bg-income-soft px-4 py-2.5 text-sm font-medium text-income";

const EMPTY_FORM = { currentPassword: "", newPassword: "", confirmPassword: "" };

function PasswordChangeSection({ t }) {
  const dispatch = useDispatch();
  const { passwordStatus, passwordError } = useSelector((state) => state.auth);
  const [form, setForm] = useState(EMPTY_FORM);
  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSuccess(false);
    setLocalError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    dispatch(resetPasswordChangeState());
    setSuccess(false);

    if (form.newPassword !== form.confirmPassword) {
      setLocalError(t("profile.password.mismatch"));
      return;
    }

    const result = await dispatch(changePassword(form));
    if (changePassword.fulfilled.match(result)) {
      setSuccess(true);
      setForm(EMPTY_FORM);
    }
  };

  return (
    <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100">
      <h2 className="text-lg font-bold text-slate-900">{t("profile.password.title")}</h2>

      <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="currentPassword" className={labelClass}>
            {t("profile.password.currentLabel")}
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            value={form.currentPassword}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="newPassword" className={labelClass}>
            {t("profile.password.newLabel")}
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            minLength={8}
            value={form.newPassword}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmPassword" className={labelClass}>
            {t("profile.password.confirmLabel")}
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            minLength={8}
            value={form.confirmPassword}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>

        <p className="text-xs text-slate-400 sm:col-span-2">{t("profile.password.hint")}</p>

        <div className="flex flex-col justify-end gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
          {(localError || passwordError) && <p className={errorClass}>{localError || passwordError}</p>}
          {success && <p className={successClass}>{t("profile.password.success")}</p>}
          <button
            type="submit"
            disabled={passwordStatus === "loading"}
            className="ms-auto rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-65"
          >
            {passwordStatus === "loading" ? t("profile.password.submitting") : t("profile.password.submit")}
          </button>
        </div>
      </form>
    </section>
  );
}

export default PasswordChangeSection;
