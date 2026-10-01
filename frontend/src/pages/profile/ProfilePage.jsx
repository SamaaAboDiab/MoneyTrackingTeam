import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import AvatarSection from "./components/AvatarSection";
import ProfileForm from "./components/ProfileForm";
import EmailChangeSection from "./components/EmailChangeSection";
import PasswordChangeSection from "./components/PasswordChangeSection";
import PageHeader from "../../components/common/PageHeader";
import { UserRound } from "lucide-react";

function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader icon={UserRound} title={t("profile.title")} subtitle={t("profile.subtitle")} />

      <AvatarSection user={user} t={t} />
      <ProfileForm user={user} t={t} />
      <EmailChangeSection t={t} />
      <PasswordChangeSection t={t} />
    </div>
  );
}

export default ProfilePage;
