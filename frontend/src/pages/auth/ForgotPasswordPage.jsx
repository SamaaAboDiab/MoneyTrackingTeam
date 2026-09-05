import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { forgotPassword, clearAuthError } from "../../features/auth/authSlice";

function ForgotPasswordPage() {
  const dispatch = useDispatch();
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
        <h1>نسيت كلمة السر</h1>

        {sent ? (
          <p className="auth-success">
            لو الإيميل ده مسجّل عندنا، هيوصلك رابط لاستعادة كلمة السر. الرابط
            صالح لمدة 24 ساعة فقط.
          </p>
        ) : (
          <>
            <p>أدخل بريدك الإلكتروني وهنبعتلك رابط لإعادة تعيين كلمة السر.</p>

            {error && <p className="auth-error">{error}</p>}

            <label htmlFor="email">البريد الإلكتروني</label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button type="submit" disabled={status === "loading"}>
              {status === "loading" ? "جارٍ الإرسال..." : "إرسال رابط الاستعادة"}
            </button>
          </>
        )}

        <p>
          <Link to="/login">الرجوع لتسجيل الدخول</Link>
        </p>
      </form>
    </div>
  );
}

export default ForgotPasswordPage;
