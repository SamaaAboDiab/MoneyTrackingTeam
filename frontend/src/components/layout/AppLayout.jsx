import { useDispatch, useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { logout } from "../../features/auth/authSlice";
import "./AppLayout.css";

function AppLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <span className="app-brand">Money Tracker</span>
        <div className="app-header-actions">
          <button type="button" onClick={() => navigate("/accounts")}>
            الحسابات
          </button>
          {user && <span className="app-user-name">{user.name}</span>}
          <button type="button" className="logout-btn" onClick={handleLogout}>
            تسجيل الخروج
          </button>
        </div>
      </header>

      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
