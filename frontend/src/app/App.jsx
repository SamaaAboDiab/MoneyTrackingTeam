import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import AppRoutes from "../routes/AppRoutes";
import { fetchCurrentUser, markAuthChecked } from "../store/slices/authSlice";

function App() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { token, authChecked } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser());
    } else {
      dispatch(markAuthChecked());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        {t("common.loading")}
      </div>
    );
  }

  return <AppRoutes />;
}

export default App;
