export function extractError(err, fallback) {
  const data = err.response?.data;
  if (data?.code === "SUBSCRIPTION_EXPIRED") {
    return "انتهى اشتراكك. جدّد اشتراكك عشان تقدر تعدّل بياناتك.";
  }
  return data?.message || fallback;
}
