import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword, clearAuthError } from "../../features/auth/authSlice";

function ResetPasswordPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
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
      setFormError("كلمة السر وتأكيدها مش متطابقين");
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
          <h1>رابط غير صالح</h1>
          <p className="auth-error">
            الرابط ده ناقص أو غير صحيح. اطلب رابط استعادة جديد.
          </p>
          <p>
            <Link to="/forgot-password">طلب رابط جديد</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>تعيين كلمة سر جديدة</h1>

        {(formError || error) && (
          <p className="auth-error">{formError || error}</p>
        )}

        <label htmlFor="password">كلمة السر الجديدة</label>
        <input
          id="password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        <label htmlFor="confirmPassword">تأكيد كلمة السر</label>
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
          {status === "loading" ? "جارٍ الحفظ..." : "حفظ كلمة السر"}
        </button>
      </form>
    </div>
  );
}

export default ResetPasswordPage;
