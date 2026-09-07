import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>{t("auth.login.title")}</h1>

        {location.state?.registered && (
          <p className="auth-success">{t("auth.login.registeredSuccess")}</p>
        )}

        {location.state?.passwordReset && (
          <p className="auth-success">
            {t("auth.login.passwordResetSuccess")}
          </p>
        )}

        {error && <p className="auth-error">{error}</p>}

        <label htmlFor="email">{t("auth.login.emailLabel")}</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="password">{t("auth.login.passwordLabel")}</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <label className="auth-checkbox">
          <input
            id="rememberMe"
            name="rememberMe"
            type="checkbox"
            checked={form.rememberMe}
            onChange={handleChange}
          />
          {t("auth.login.rememberMe")}
        </label>

        <button type="submit" disabled={status === "loading"}>
          {status === "loading"
            ? t("auth.login.submitting")
            : t("auth.login.submit")}
        </button>

        <p>
          <Link to="/forgot-password">{t("auth.login.forgotPassword")}</Link>
        </p>
        <p>
          {t("auth.login.noAccount")}{" "}
          <Link to="/register">{t("auth.login.registerLink")}</Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
