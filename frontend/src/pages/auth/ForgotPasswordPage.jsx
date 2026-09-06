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
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>{t("auth.forgotPassword.title")}</h1>

        {sent ? (
          <p className="auth-success">{t("auth.forgotPassword.sentMessage")}</p>
        ) : (
          <>
            <p>{t("auth.forgotPassword.instructions")}</p>

            {error && <p className="auth-error">{error}</p>}

            <label htmlFor="email">{t("auth.forgotPassword.emailLabel")}</label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button type="submit" disabled={status === "loading"}>
              {status === "loading"
                ? t("auth.forgotPassword.submitting")
                : t("auth.forgotPassword.submit")}
            </button>
          </>
        )}

        <p>
          <Link to="/login">{t("auth.forgotPassword.backToLogin")}</Link>
        </p>
      </form>
    </div>
  );
}

export default ForgotPasswordPage;
