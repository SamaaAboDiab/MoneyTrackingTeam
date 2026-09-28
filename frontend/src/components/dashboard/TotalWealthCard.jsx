import { useEffect, useState } from "react";
import { Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";
import { formatAmount } from "../../utils/formatAmount";

function TotalWealthCard({
  label,
  amount,
  currency,
  onOpenAccounts,
  trend = "up",
  trendData = [],
  maskedText = "••••••",
  showAriaLabel,
  hideAriaLabel,
}) {
  const [hidden, setHidden] = useState(false);
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const isUp = trend !== "down";
  const capsuleClass = isUp ? "bg-income" : "bg-expense";
  const TrendIcon = isUp ? ArrowUp : ArrowDown;

  const maxTrendValue = trendData.length ? Math.max(...trendData, 1) : 0;

  return (
    <div className="relative">
      <div
        role="button"
        tabIndex={0}
        onClick={onOpenAccounts}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") onOpenAccounts();
        }}
        className={`relative overflow-hidden rounded-3xl bg-brand-600 p-6 transition-all duration-300 ease-out sm:p-8 ${
          grown ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Top row */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white/80">{label}</span>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setHidden((prev) => !prev);
            }}
            aria-label={hidden ? showAriaLabel : hideAriaLabel}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
          >
            {hidden ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        {/* Main row */}
        <div className="mt-6 flex items-end justify-between gap-4">
          <div
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 transition-all duration-300 ease-out ${capsuleClass} ${
              grown ? "scale-100 opacity-100 delay-150" : "scale-90 opacity-0"
            }`}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/25">
              <TrendIcon size={13} strokeWidth={2.5} className="text-white" />
            </span>
            <span className="relative grid font-bold text-white">
              <span
                className={`tabular-amount col-start-1 row-start-1 transition-opacity duration-200 ${
                  hidden ? "opacity-0" : "opacity-100"
                }`}
              >
                {currency} {formatAmount(amount)}
              </span>
              <span
                className={`col-start-1 row-start-1 tracking-widest transition-opacity duration-200 ${
                  hidden ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden={!hidden}
              >
                {maskedText}
              </span>
            </span>
          </div>

          {trendData.length > 0 && (
            <div className="flex h-16 flex-1 items-end justify-end gap-1">
              {trendData.map((value, index) => {
                const heightPct = Math.max((value / maxTrendValue) * 100, 6);
                return (
                  <div
                    key={index}
                    className="w-1.5 rounded-full bg-white/25 transition-all duration-500 ease-out"
                    style={{
                      height: grown ? `${heightPct}%` : "0%",
                      transitionDelay: `${150 + index * 40}ms`,
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TotalWealthCard;
