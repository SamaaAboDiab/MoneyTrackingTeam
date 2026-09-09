// Financial amounts must always render with Western (0-9) digits, regardless of the
// active UI language — using the browser's default locale can produce Eastern Arabic
// numerals when the OS/browser locale is Arabic.
export function formatAmount(value, options = {}) {
  return Number(value).toLocaleString("en-US", {
    maximumFractionDigits: 2,
    ...options,
  });
}
