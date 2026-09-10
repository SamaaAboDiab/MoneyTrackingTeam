import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import AvatarSection from "./components/AvatarSection";
import ProfileForm from "./components/ProfileForm";

function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-extrabold text-slate-900">{t("profile.title")}</h1>
      <p className="mt-1 text-slate-500">{t("profile.subtitle")}</p>

      <AvatarSection user={user} t={t} />
      <ProfileForm user={user} t={t} />
    </div>
  );
}

export default ProfilePage;
