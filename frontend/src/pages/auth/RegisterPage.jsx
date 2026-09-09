import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";
import { registerUser, clearAuthError } from "../../store/slices/authSlice";

const passwordInputClass =
  "w-full rounded-xl border border-slate-200 px-4 py-2.5 pe-11 text-sm outline-none transition focus:border-brand-500";

function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { status, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [formError, setFormError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    dispatch(clearAuthError());

    if (form.password !== form.confirmPassword) {
      setFormError(t("auth.register.passwordMismatch"));
      return;
    }
    if (!form.agreeTerms) {
      setFormError(t("auth.register.mustAgreeTerms"));
      return;
    }

    const result = await dispatch(
      registerUser({ name: form.name, email: form.email, password: form.password })
    );
    if (registerUser.fulfilled.match(result)) {
      navigate("/login", { state: { registered: true, email: form.email } });
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
            {t("auth.register.title")}
          </h1>
        </div>

        {(formError || error) && (
          <p className="mb-4 rounded-xl bg-expense-soft px-4 py-2.5 text-sm font-medium text-expense">
            {formError || error}
          </p>
        )}

        <label htmlFor="name" className="mb-1.5 mt-4 block text-sm font-semibold text-slate-700">
          {t("auth.register.nameLabel")}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500"
        />

        <label htmlFor="email" className="mb-1.5 mt-4 block text-sm font-semibold text-slate-700">
          {t("auth.register.emailLabel")}
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
          {t("auth.register.passwordLabel")}
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
            className={passwordInputClass}
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

        <label htmlFor="confirmPassword" className="mb-1.5 mt-4 block text-sm font-semibold text-slate-700">
          {t("auth.register.confirmPasswordLabel")}
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={form.confirmPassword}
            onChange={handleChange}
            required
            minLength={6}
            className={passwordInputClass}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute inset-y-0 inset-e-0 flex w-11 items-center justify-center text-slate-400 hover:text-slate-600"
            aria-label={showConfirmPassword ? t("auth.hidePassword") : t("auth.showPassword")}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-600">
          <input
            id="agreeTerms"
            name="agreeTerms"
            type="checkbox"
            checked={form.agreeTerms}
            onChange={handleChange}
            className="h-4 w-4 rounded border-slate-300 text-brand-600"
          />
          {t("auth.register.agreeTerms")}
        </label>

        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-6 w-full rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading"
            ? t("auth.register.submitting")
            : t("auth.register.submit")}
        </button>

        <p className="mt-6 text-center text-sm text-slate-500">
          {t("auth.register.haveAccount")}{" "}
          <Link to="/login" className="font-semibold text-brand-600 hover:underline">
            {t("auth.register.loginLink")}
          </Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;
