import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { loginAdmin } from "../../store/slices/adminAuthSlice";
import AuthCard from "../auth/components/AuthCard";
import AuthFormHeader from "../auth/components/AuthFormHeader";
import AuthBanner from "../auth/components/AuthBanner";
import PasswordField from "../auth/components/PasswordField";
import AuthSubmitButton from "../auth/components/AuthSubmitButton";

function AdminLoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { token, status, error, sessionExpired } = useSelector((state) => state.adminAuth);
  const [form, setForm] = useState({ email: "", password: "" });

  if (token) return <Navigate to="/admin" replace />;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginAdmin(form));
    if (loginAdmin.fulfilled.match(result)) {
      navigate("/admin", { replace: true });
    }
  };

  return (
    <AuthCard onSubmit={handleSubmit}>
      <AuthFormHeader title={t("admin.login.title")} subtitle={t("admin.login.subtitle")} />

      {sessionExpired && !error && <AuthBanner>{t("admin.login.sessionExpired")}</AuthBanner>}
      {error && <AuthBanner>{error}</AuthBanner>}

      <label htmlFor="admin-email" className="mb-1.5 mt-3 block text-sm font-semibold text-slate-700">
        {t("admin.login.emailLabel")}
      </label>
      <input
        id="admin-email"
        name="email"
        type="email"
        dir="ltr"
        autoComplete="username"
        value={form.email}
        onChange={handleChange}
        required
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500"
      />

      <PasswordField
        id="admin-password"
        name="password"
        label={t("admin.login.passwordLabel")}
        value={form.password}
        onChange={handleChange}
        t={t}
      />

      <AuthSubmitButton
        loading={status === "loading"}
        loadingLabel={t("admin.login.submitting")}
        label={t("admin.login.submit")}
      />

      <p className="mt-4 text-center text-sm text-slate-500">
        <Link to="/login" className="font-semibold text-brand-600 hover:underline">
          {t("admin.login.userLoginLink")}
        </Link>
      </p>
    </AuthCard>
  );
}

export default AdminLoginPage;
