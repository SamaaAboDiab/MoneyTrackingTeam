import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);

  return (
    <div>
      <h1>{t("dashboard.title")}</h1>
      {user && <p>{t("dashboard.greeting", { name: user.name })}</p>}
      <p>
        <Link to="/accounts/transfer">{t("dashboard.transferLink")}</Link>
      </p>
    </div>
  );
}

export default DashboardPage;
