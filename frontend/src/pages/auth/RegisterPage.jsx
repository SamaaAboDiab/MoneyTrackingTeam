import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { registerUser, clearAuthError } from "../../features/auth/authSlice";

function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());
    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) {
      navigate("/login", { state: { registered: true, email: form.email } });
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>إنشاء حساب جديد</h1>

        {error && <p className="auth-error">{error}</p>}

        <label htmlFor="name">الاسم</label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          required
        />

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
          minLength={6}
        />

        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "جارٍ الإنشاء..." : "إنشاء حساب"}
        </button>

        <p>
          عندك حساب بالفعل؟ <Link to="/login">تسجيل الدخول</Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterPage;
