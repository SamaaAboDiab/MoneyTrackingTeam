import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { resetPassword, clearAuthError } from "../../store/slices/authSlice";

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
      <div className="auth-page">
        <div className="auth-form">
          <h1>{t("auth.resetPassword.invalidTitle")}</h1>
          <p className="auth-error">{t("auth.resetPassword.invalidMessage")}</p>
          <p>
            <Link to="/forgot-password">
              {t("auth.resetPassword.requestNewLink")}
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>{t("auth.resetPassword.title")}</h1>

        {(formError || error) && (
          <p className="auth-error">{formError || error}</p>
        )}

        <label htmlFor="password">
          {t("auth.resetPassword.newPasswordLabel")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        <label htmlFor="confirmPassword">
          {t("auth.resetPassword.confirmPasswordLabel")}
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
        />

        <button type="submit" disabled={status === "loading"}>
          {status === "loading"
            ? t("auth.resetPassword.submitting")
            : t("auth.resetPassword.submit")}
        </button>
      </form>
    </div>
  );
}

export default ResetPasswordPage;
