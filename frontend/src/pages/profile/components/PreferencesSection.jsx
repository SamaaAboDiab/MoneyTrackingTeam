import { Check } from "lucide-react";
import { THEME_OPTIONS, setTheme, useTheme } from "../../../utils/theme";
import useChangeLanguage from "../../../i18n/useChangeLanguage";
import Select from "../../../components/common/Select";

const LANGUAGES = [
  { id: "ar", label: "العربية (AR)" },
  { id: "en", label: "English (EN)" },
];

const selectClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-brand-500";

// One setting: its title and explanation above its control.
function SettingGroup({ id, title, description, children }) {
  return (
    <div className="px-5 py-6 sm:px-6">
      <h3 id={id} className="text-sm font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

// A miniature of the app in a theme's colors: sidebar, page header, total card and two cards.
function ThemeMockup({ preview }) {
  const line = (width, color) => (
    <span className="block h-1.5 rounded-full" style={{ width, backgroundColor: color }} />
  );
  return (
    <span aria-hidden="true" className="flex h-32 overflow-hidden rounded-lg bg-slate-50 ring-1 ring-slate-200/80">
      <span
        className="flex w-[27%] flex-col gap-2 border-e p-2.5"
        style={{ backgroundColor: preview.sidebar, borderColor: preview.sidebarLine }}
      >
        <span className="mb-1 flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: preview.accent }} />
          {line("55%", preview.sidebarLine)}
        </span>
        <span className="block h-2.5 rounded" style={{ backgroundColor: preview.sidebarActive }} />
        {line("80%", preview.sidebarLine)}
        {line("65%", preview.sidebarLine)}
      </span>
      <span className="flex flex-1 flex-col gap-2 p-2.5">
        <span className="flex items-center justify-between gap-2">
          {line("38%", "#cbd5e1")}
          <span className="h-2.5 w-7 rounded" style={{ backgroundColor: preview.primary }} />
        </span>
        <span
          className="flex flex-col gap-1.5 rounded-md p-2"
          style={{ backgroundImage: `linear-gradient(135deg, ${preview.heroStart}, ${preview.heroEnd})` }}
        >
          {line("30%", "rgb(255 255 255 / 0.45)")}
          <span className="flex items-center gap-1">
            <span className="block h-1.5 w-[35%] rounded-full bg-white" />
            {line("14%", preview.accent)}
          </span>
        </span>
        <span className="grid flex-1 grid-cols-2 gap-1.5">
          {[0, 1].map((card) => (
            <span key={card} className="flex flex-col gap-1.5 rounded bg-white p-1.5 ring-1 ring-slate-200">
              {line("45%", "#cbd5e1")}
              {line("70%", "#e2e8f0")}
            </span>
          ))}
        </span>
      </span>
    </span>
  );
}

// Settings → Preferences: theme and language, both applied instantly.
function PreferencesSection({ t, i18n }) {
  const theme = useTheme();
  const changeLanguage = useChangeLanguage();
  const language = i18n.language === "en" ? "en" : "ar";

  return (
    <div className="divide-y divide-slate-100">
      <SettingGroup
        id="preferences-theme"
        title={t("profile.preferences.theme.title")}
        description={t("profile.preferences.theme.description")}
      >
        <div role="radiogroup" aria-labelledby="preferences-theme" className="grid max-w-3xl gap-4 sm:grid-cols-2">
          {THEME_OPTIONS.map(({ id, preview }) => {
            const selected = theme === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setTheme(id)}
                className={`group rounded-2xl border bg-white p-2 text-start transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20 ${
                  selected ? "border-brand-600 ring-1 ring-brand-600" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <ThemeMockup preview={preview} />
                <span className="flex items-center gap-3 px-2 pb-1.5 pt-3">
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{t(`theme.${id}.name`)}</span>
                      {/* The theme's palette at a glance. */}
                      <span aria-hidden="true" className="flex -space-x-1">
                        {[preview.primary, preview.accent, preview.heroEnd].map((color) => (
                          <span key={color} className="h-3 w-3 rounded-full ring-2 ring-white" style={{ backgroundColor: color }} />
                        ))}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">{t(`theme.${id}.description`)}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                      selected ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 group-hover:border-slate-400"
                    }`}
                  >
                    {selected && <Check size={12} strokeWidth={3} />}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </SettingGroup>

      <SettingGroup
        id="preferences-language"
        title={t("profile.preferences.language.title")}
        description={t("profile.preferences.language.description")}
      >
        <div className="max-w-xs">
          <Select
            id="preferences-language-select"
            name="language"
            value={language}
            onChange={(event) => changeLanguage(event.target.value)}
            className={selectClass}
          >
            {LANGUAGES.map(({ id, label }) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </Select>
        </div>
      </SettingGroup>
    </div>
  );
}

export default PreferencesSection;
