import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { loginUser, clearAuthError } from "../../features/auth/authSlice";

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
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
        <h1>تسجيل الدخول</h1>

        {location.state?.registered && (
          <p className="auth-success">
            تم إنشاء الحساب بنجاح، سجّل دخولك الآن
          </p>
        )}

        {location.state?.passwordReset && (
          <p className="auth-success">
            تم تغيير كلمة السر بنجاح، سجّل دخولك بكلمة السر الجديدة
          </p>
        )}

        {error && <p className="auth-error">{error}</p>}

        <label htmlFor="email">البريد الإلكتروني</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="password">كلمة السر</label>
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
          تذكرني
        </label>

        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "جارٍ الدخول..." : "تسجيل الدخول"}
        </button>

        <p>
          <Link to="/forgot-password">نسيت كلمة السر؟</Link>
        </p>
        <p>
          مفيش حساب؟ <Link to="/register">إنشاء حساب جديد</Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
