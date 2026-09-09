import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";
import { loginUser, clearAuthError } from "../../store/slices/authSlice";

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
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/60 ring-1 ring-slate-100"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-lg font-black text-white">
            S
          </span>
          <h1 className="mt-3 text-2xl font-extrabold text-slate-900">
            {t("auth.login.title")}
          </h1>
        </div>

        {location.state?.registered && (
          <p className="mb-4 rounded-xl bg-income-soft px-4 py-2.5 text-sm font-medium text-income">
            {t("auth.login.registeredSuccess")}
          </p>
        )}

        {location.state?.passwordReset && (
          <p className="mb-4 rounded-xl bg-income-soft px-4 py-2.5 text-sm font-medium text-income">
            {t("auth.login.passwordResetSuccess")}
          </p>
        )}

        {error && (
          <p className="mb-4 rounded-xl bg-expense-soft px-4 py-2.5 text-sm font-medium text-expense">
            {error}
          </p>
        )}

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

        <label htmlFor="password" className="mb-1.5 mt-4 block text-sm font-semibold text-slate-700">
          {t("auth.login.passwordLabel")}
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pe-11 text-sm outline-none transition focus:border-brand-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 inset-e-0 flex w-11 items-center justify-center text-slate-400 hover:text-slate-600"
            aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

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

        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-6 w-full rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading"
            ? t("auth.login.submitting")
            : t("auth.login.submit")}
        </button>

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
      </form>
    </div>
  );
}

export default LoginPage;
