import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { forgotPassword, clearAuthError } from "../../store/slices/authSlice";

function ForgotPasswordPage() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { status, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());
    const result = await dispatch(forgotPassword({ email }));
    if (forgotPassword.fulfilled.match(result)) {
      setSent(true);
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
            {t("auth.forgotPassword.title")}
          </h1>
        </div>

        {sent ? (
          <p className="mb-4 rounded-xl bg-income-soft px-4 py-2.5 text-sm font-medium text-income">
            {t("auth.forgotPassword.sentMessage")}
          </p>
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-500">
              {t("auth.forgotPassword.instructions")}
            </p>

            {error && (
              <p className="mb-4 rounded-xl bg-expense-soft px-4 py-2.5 text-sm font-medium text-expense">
                {error}
              </p>
            )}

            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">
              {t("auth.forgotPassword.emailLabel")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500"
            />

            <button
              type="submit"
              disabled={status === "loading"}
              className="mt-6 w-full rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "loading"
                ? t("auth.forgotPassword.submitting")
                : t("auth.forgotPassword.submit")}
            </button>
          </>
        )}

        <p className="mt-6 text-center text-sm">
          <Link to="/login" className="font-semibold text-brand-600 hover:underline">
            {t("auth.forgotPassword.backToLogin")}
          </Link>
        </p>
      </form>
    </div>
  );
}

export default ForgotPasswordPage;
