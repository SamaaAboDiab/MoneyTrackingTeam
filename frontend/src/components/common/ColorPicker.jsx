import { useId } from "react";
import { useTranslation } from "react-i18next";
import { Check, Pipette } from "lucide-react";

const DEFAULT_SWATCHES = [
  "#334155",
  "#4f46e5",
  "#2563eb",
  "#0891b2",
  "#059669",
  "#65a30d",
  "#d97706",
  "#dc2626",
  "#db2777",
  "#7c3aed",
];

// Preset swatches + a custom-color button (opens the native picker) + the current hex code,
// laid out inside a field that matches the app's other inputs.
function ColorPicker({ id, name, value, onChange, swatches = DEFAULT_SWATCHES, labelledBy }) {
  const { t } = useTranslation();
  const generatedId = useId();
  const inputId = id || `color-${generatedId}`;
  const current = (value || "").toLowerCase();
  const isCustom = current && !swatches.includes(current);

  const emit = (color) => onChange?.({ target: { name, value: color } });

  return (
    <div className="flex min-h-[46px] flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
      <div role="radiogroup" aria-labelledby={labelledBy} className="flex flex-wrap items-center gap-2">
        {swatches.map((color) => {
          const selected = current === color;
          return (
            <button
              key={color}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={color}
              title={color.toUpperCase()}
              onClick={() => emit(color)}
              className={`flex h-7 w-7 items-center justify-center rounded-full transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 ${
                selected ? "ring-2 ring-slate-900/15 ring-offset-2" : ""
              }`}
              style={{ backgroundColor: color, outlineColor: color }}
            >
              {selected && <Check size={14} strokeWidth={3} className="text-white" />}
            </button>
          );
        })}

        {/* Custom color: the native input sits on top of the button so a click opens the picker. */}
        <span
          className={`relative flex h-7 w-7 items-center justify-center rounded-full transition hover:scale-110 ${
            isCustom ? "ring-2 ring-slate-900/15 ring-offset-2" : ""
          }`}
          style={{
            background: isCustom
              ? current
              : "conic-gradient(#ef4444, #f59e0b, #84cc16, #06b6d4, #6366f1, #d946ef, #ef4444)",
          }}
          title={t("common.colorPicker.custom")}
        >
          {isCustom ? (
            <Check size={14} strokeWidth={3} className="text-white" />
          ) : (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/90 text-slate-600">
              <Pipette size={10} strokeWidth={2.5} />
            </span>
          )}
          <input
            id={inputId}
            type="color"
            value={current || swatches[0]}
            onChange={(event) => emit(event.target.value.toLowerCase())}
            aria-label={t("common.colorPicker.custom")}
            className="absolute inset-0 h-full w-full cursor-pointer rounded-full opacity-0"
          />
        </span>
      </div>

      <span className="ms-auto flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1 ring-1 ring-slate-100">
        <span className="h-3 w-3 rounded-full ring-1 ring-black/10" style={{ backgroundColor: current || swatches[0] }} />
        <span dir="ltr" className="font-mono text-xs font-semibold uppercase tracking-wide text-slate-600">
          {current || swatches[0]}
        </span>
      </span>
    </div>
  );
}

export default ColorPicker;
