import { useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Settings, ShieldCheck, UserRound } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import AdminInfoTab from "./settings/AdminInfoTab";
import AdminSecurityTab from "./settings/AdminSecurityTab";
import AdminProfileCard from "./settings/AdminProfileCard";
import LanguageMenu from "./settings/LanguageMenu";

const TABS = [
  { key: "information", icon: UserRound, label: "profile.tabs.information", hint: "admin.settings.infoHint", tone: "bg-brand-50 text-brand-600" },
  { key: "security", icon: ShieldCheck, label: "profile.tabs.security", hint: "admin.settings.securityHint", tone: "bg-amber-50 text-amber-600" },
];

// The signed-in admin's settings: profile card and a menu on one side, the chosen section on the other.
function AdminSettingsPage() {
  const { t, i18n } = useTranslation();
  const { admin } = useSelector((state) => state.adminAuth);
  const [activeTab, setActiveTab] = useState("information");
  const [openSection, setOpenSection] = useState(null);

  const openSecuritySection = (section) => {
    setActiveTab("security");
    setOpenSection(section);
  };

  const handleTabKeyDown = (event) => {
    const keys = TABS.map((tab) => tab.key);
    const currentIndex = keys.indexOf(activeTab);
    let nextIndex;
    if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = keys.length - 1;
    else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      nextIndex = (currentIndex + (event.key === "ArrowDown" ? 1 : -1) + keys.length) % keys.length;
    } else {
      return;
    }
    event.preventDefault();
    setActiveTab(keys[nextIndex]);
    document.getElementById(`admin-settings-tab-${keys[nextIndex]}`)?.focus();
  };

  return (
    <div className="mx-auto max-w-6xl pb-8">
      <PageHeader icon={Settings} title={t("admin.settings.title")} subtitle={t("admin.settings.subtitle")} />

      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <aside className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 lg:content-start">
          <AdminProfileCard admin={admin} t={t} />

          <nav className="rounded-3xl border border-slate-200/80 bg-white p-2 shadow-sm">
            <div role="tablist" aria-orientation="vertical" aria-label={t("admin.settings.title")} onKeyDown={handleTabKeyDown}>
              {TABS.map(({ key, icon: TabIcon, label, hint, tone }) => {
                const selected = activeTab === key;
                return (
                  <button
                    key={key}
                    id={`admin-settings-tab-${key}`}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls={`admin-settings-panel-${key}`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setActiveTab(key)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-start transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/15 ${
                      selected ? "bg-slate-100" : "hover:bg-slate-50"
                    }`}
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                      <TabIcon size={18} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-sm font-bold ${selected ? "text-slate-900" : "text-slate-700"}`}>{t(label)}</span>
                      <span className="block truncate text-xs text-slate-500">{t(hint)}</span>
                    </span>
                    <ChevronLeft size={16} className={`shrink-0 ltr:rotate-180 ${selected ? "text-slate-500" : "text-slate-300"}`} aria-hidden="true" />
                  </button>
                );
              })}
            </div>

            {/* Language: opens a small menu in place (not a section). */}
            <div className="mt-1 flex items-center justify-between gap-3 border-t border-slate-100 px-3 pt-3 pb-1">
              <span className="text-xs font-semibold text-slate-500">{t("admin.settings.languageTitle")}</span>
              <LanguageMenu t={t} i18n={i18n} />
            </div>
          </nav>
        </aside>

        <div className="min-w-0">
          <section id="admin-settings-panel-information" role="tabpanel" aria-labelledby="admin-settings-tab-information" hidden={activeTab !== "information"}>
            <AdminInfoTab admin={admin} t={t} onEditSecurity={openSecuritySection} />
          </section>
          <section id="admin-settings-panel-security" role="tabpanel" aria-labelledby="admin-settings-tab-security" hidden={activeTab !== "security"}>
            <AdminSecurityTab admin={admin} t={t} openSection={openSection} setOpenSection={setOpenSection} />
          </section>
        </div>
      </div>
    </div>
  );
}

export default AdminSettingsPage;
