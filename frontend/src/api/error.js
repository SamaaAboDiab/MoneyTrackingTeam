// خريطة أكواد الأخطاء الخاصة الراجعة من الباك إند (error.code) لرسالة عربية واضحة.
// راجع backend-accounting-system/postman/README.md وstructure/03-api-map.md لتفاصيل كل كود.
const ERROR_CODE_MESSAGES = {
  SUBSCRIPTION_EXPIRED: "انتهى اشتراكك. جدّد اشتراكك عشان تقدر تعدّل بياناتك.",
  TRIAL_LIMIT_1_ACCOUNT: "الحساب التجريبي يسمح بحساب واحد فقط.",
  TRIAL_LIMIT_20_ENTRIES: "وصلت لحد 20 عملية في الفترة التجريبية.",
  ACCOUNT_SUSPENDED: "تم إيقاف حسابك، تواصل مع الدعم.",
};

// رسائل افتراضية حسب HTTP status لما الباك إند ميرجعش message واضحة.
const STATUS_MESSAGES = {
  400: "البيانات المُرسلة غير صحيحة.",
  401: "انتهت صلاحية الجلسة، سجّل الدخول مرة أخرى.",
  403: "غير مسموح لك بتنفيذ هذا الإجراء.",
  404: "العنصر المطلوب غير موجود.",
  409: "البيانات متعارضة مع بيانات موجودة بالفعل.",
  413: "حجم الملف كبير جدًا.",
  429: "محاولات كثيرة جدًا، حاول مرة أخرى لاحقًا.",
  500: "حدث خطأ في السيرفر، حاول لاحقًا.",
};

/**
 * يستخرج رسالة خطأ عربية موحّدة من استجابة axios، بحيث يستخدمها أي slice
 * بدل ما يكرر منطق قراءة code/message/status بنفسه.
 * @param {import('axios').AxiosError} err
 * @param {string} fallback رسالة احتياطية لو مفيش أي معلومة من السيرفر
 */
export function extractError(err, fallback = "حدث خطأ غير متوقع") {
  const status = err?.response?.status;
  const data = err?.response?.data;

  if (data?.code && ERROR_CODE_MESSAGES[data.code]) {
    return ERROR_CODE_MESSAGES[data.code];
  }

  if (data?.message) {
    return data.message;
  }

  if (status && STATUS_MESSAGES[status]) {
    return STATUS_MESSAGES[status];
  }

  if (!err?.response) {
    return "تعذّر الاتصال بالسيرفر، تحقّق من اتصالك بالإنترنت.";
  }

  return fallback;
}

/** بيرجع كود الخطأ الخاص (زي SUBSCRIPTION_EXPIRED) لو موجود، وإلا null. */
export function getErrorCode(err) {
  return err?.response?.data?.code || null;
}

/** بيرجع الـ HTTP status code بتاع الخطأ لو موجود. */
export function getErrorStatus(err) {
  return err?.response?.status || null;
}
