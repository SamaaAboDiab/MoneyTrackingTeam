import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { loginUser, clearAuthError } from "../../store/slices/authSlice";
import AuthCard from "./components/AuthCard";
import AuthLogo from "./components/AuthLogo";
import AuthBanner from "./components/AuthBanner";
import PasswordField from "./components/PasswordField";
import AuthSubmitButton from "./components/AuthSubmitButton";

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { status, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    email: location.state?.email || "",
    password: "",
    rememberMe: false,
  });

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      navigate("/dashboard");
    }
  };

  return (
    <AuthCard onSubmit={handleSubmit}>
      <AuthLogo title={t("auth.login.title")} />

      {location.state?.registered && (
        <AuthBanner variant="success">{t("auth.login.registeredSuccess")}</AuthBanner>
      )}
      {location.state?.passwordReset && (
        <AuthBanner variant="success">{t("auth.login.passwordResetSuccess")}</AuthBanner>
      )}
      {error && <AuthBanner>{error}</AuthBanner>}

      <label htmlFor="email" className="mb-1.5 mt-4 block text-sm font-semibold text-slate-700">
        {t("auth.login.emailLabel")}
      </label>
      <input
        id="email"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        required
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500"
      />

      <PasswordField
        id="password"
        name="password"
        label={t("auth.login.passwordLabel")}
        value={form.password}
        onChange={handleChange}
        t={t}
      />

      <label className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-600">
        <input
          id="rememberMe"
          name="rememberMe"
          type="checkbox"
          checked={form.rememberMe}
          onChange={handleChange}
          className="h-4 w-4 rounded border-slate-300 text-brand-600"
        />
        {t("auth.login.rememberMe")}
      </label>

      <AuthSubmitButton
        loading={status === "loading"}
        loadingLabel={t("auth.login.submitting")}
        label={t("auth.login.submit")}
      />

      <p className="mt-6 text-center text-sm">
        <Link to="/forgot-password" className="font-semibold text-brand-600 hover:underline">
          {t("auth.login.forgotPassword")}
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-slate-500">
        {t("auth.login.noAccount")}{" "}
        <Link to="/register" className="font-semibold text-brand-600 hover:underline">
          {t("auth.login.registerLink")}
        </Link>
      </p>
    </AuthCard>
  );
}

export default LoginPage;
