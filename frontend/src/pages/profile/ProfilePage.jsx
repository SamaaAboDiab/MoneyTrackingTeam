import { useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import AvatarSection from "./components/AvatarSection";
import ProfileForm from "./components/ProfileForm";
import EmailChangeSection from "./components/EmailChangeSection";
import PhoneChangeSection from "./components/PhoneChangeSection";
import PasswordChangeSection from "./components/PasswordChangeSection";
import PageHeader from "../../components/common/PageHeader";
import { ShieldCheck, UserRound } from "lucide-react";

const PROFILE_TABS = ["information", "security"];

function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("information");
  const [securityRequest, setSecurityRequest] = useState({ section: null, id: 0 });

  const openSecuritySection = (section) => {
    setActiveTab("security");
    setSecurityRequest((previous) => ({ section, id: previous.id + 1 }));
  };
  const clearSecurityRequest = () => {
    setSecurityRequest((previous) => ({ ...previous, section: null }));
  };

  const handleTabKeyDown = (event) => {
    const currentIndex = PROFILE_TABS.indexOf(activeTab);
    let nextIndex;

    if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = PROFILE_TABS.length - 1;
    else if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      const isRtl = document.documentElement.dir === "rtl";
      const direction = event.key === "ArrowRight" ? 1 : -1;
      nextIndex = (currentIndex + direction * (isRtl ? -1 : 1) + PROFILE_TABS.length) % PROFILE_TABS.length;
    } else {
      return;
    }

    event.preventDefault();
    setActiveTab(PROFILE_TABS[nextIndex]);
    document.getElementById(`profile-tab-${PROFILE_TABS[nextIndex]}`)?.focus();
  };

  return (
    <div className="mx-auto max-w-6xl pb-8">
      <PageHeader icon={UserRound} title={t("profile.title")} subtitle={t("profile.subtitle")} />

      <div
        role="tablist"
        aria-label={t("profile.sectionsLabel")}
        onKeyDown={handleTabKeyDown}
        className="mt-6 flex w-full gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 sm:w-fit"
      >
        {PROFILE_TABS.map((tab) => {
          const selected = activeTab === tab;
          const TabIcon = tab === "security" ? ShieldCheck : UserRound;

          return (
            <button
              key={tab}
              id={`profile-tab-${tab}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`profile-panel-${tab}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveTab(tab)}
              className={`inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/15 ${
                selected
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <TabIcon size={16} aria-hidden="true" />
              {t(`profile.tabs.${tab}`)}
            </button>
          );
        })}
      </div>

      <section
        id="profile-panel-information"
        role="tabpanel"
        aria-labelledby="profile-tab-information"
        hidden={activeTab !== "information"}
        tabIndex={0}
        className="focus-visible:outline-none"
      >
        <AvatarSection user={user} t={t} />
        <ProfileForm user={user} t={t} onEditSecurity={openSecuritySection} />
      </section>

      <section
        id="profile-panel-security"
        role="tabpanel"
        aria-labelledby="profile-tab-security"
        hidden={activeTab !== "security"}
        tabIndex={0}
        className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm focus-visible:outline-none"
      >
        <header className="flex items-start gap-3 px-5 py-5 sm:px-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <ShieldCheck size={20} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-900">{t("profile.security.title")}</h2>
            <p className="mt-1 text-sm text-slate-500">{t("profile.security.subtitle")}</p>
          </div>
        </header>
        <div className="divide-y divide-slate-100 border-t border-slate-100">
          <EmailChangeSection
            key={`email-${securityRequest.id}`}
            t={t}
            currentEmail={user?.email}
            securityRequest={securityRequest}
            onClearRequest={clearSecurityRequest}
          />
          <PhoneChangeSection
            key={`phone-${securityRequest.id}`}
            user={user}
            t={t}
            securityRequest={securityRequest}
            onClearRequest={clearSecurityRequest}
          />
          <PasswordChangeSection
            key={`password-${securityRequest.id}`}
            t={t}
            securityRequest={securityRequest}
            onClearRequest={clearSecurityRequest}
          />
        </div>
      </section>
    </div>
  );
}

export default ProfilePage;
