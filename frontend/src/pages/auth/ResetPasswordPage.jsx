import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";
import { resetPassword, clearAuthError } from "../../store/slices/authSlice";

const passwordInputClass =
  "w-full rounded-xl border border-slate-200 px-4 py-2.5 pe-11 text-sm outline-none transition focus:border-brand-500";

function ResetPasswordPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { t } = useTranslation();
  const { status, error } = useSelector((state) => state.auth);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    dispatch(clearAuthError());

    if (password !== confirmPassword) {
      setFormError(t("auth.resetPassword.passwordMismatch"));
      return;
    }

    const result = await dispatch(resetPassword({ token, password }));
    if (resetPassword.fulfilled.match(result)) {
      navigate("/login", { state: { passwordReset: true } });
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl shadow-slate-200/60 ring-1 ring-slate-100">
          <div className="mb-6 flex flex-col items-center text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-lg font-black text-white">
              S
            </span>
            <h1 className="mt-3 text-2xl font-extrabold text-slate-900">
              {t("auth.resetPassword.invalidTitle")}
            </h1>
          </div>
          <p className="mb-4 rounded-xl bg-expense-soft px-4 py-2.5 text-sm font-medium text-expense">
            {t("auth.resetPassword.invalidMessage")}
          </p>
          <p className="text-sm">
            <Link to="/forgot-password" className="font-semibold text-brand-600 hover:underline">
              {t("auth.resetPassword.requestNewLink")}
            </Link>
          </p>
        </div>
      </div>
    );
  }

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
            {t("auth.resetPassword.title")}
          </h1>
        </div>

        {(formError || error) && (
          <p className="mb-4 rounded-xl bg-expense-soft px-4 py-2.5 text-sm font-medium text-expense">
            {formError || error}
          </p>
        )}

        <label htmlFor="password" className="mb-1.5 mt-4 block text-sm font-semibold text-slate-700">
          {t("auth.resetPassword.newPasswordLabel")}
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {t("auth.resetPassword.confirmPasswordLabel")}
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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

        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-6 w-full rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading"
            ? t("auth.resetPassword.submitting")
            : t("auth.resetPassword.submit")}
        </button>
      </form>
    </div>
  );
}

export default ResetPasswordPage;
