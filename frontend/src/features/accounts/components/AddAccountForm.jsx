import { useState } from "react";
import axiosClient from "../../../api/axiosClient";

const ACCOUNT_TYPES = [
  { value: "bank", label: "بنك" },
  { value: "wallet", label: "محفظة" },
  { value: "cash", label: "كاش" },
];

const DEFAULT_COLOR = "#0d9488";

function AddAccountForm({ onAccountCreated, existingAccountNames = [] }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    balance: "",
    currency: "",
    color: DEFAULT_COLOR,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (field) => (event) => {
    setFormData((previous) => ({ ...previous, [field]: event.target.value }));
    if (errors[field]) {
      setErrors((previous) => ({ ...previous, [field]: "" }));
    }
  };

  const validate = () => {
    const nextErrors = {};
    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      nextErrors.name = "اسم الحساب مطلوب";
    } else if (trimmedName.length > 100) {
      nextErrors.name = "اسم الحساب أطول من اللازم (100 حرف كحد أقصى)";
    } else if (
      existingAccountNames.some(
        (name) => name.trim().toLowerCase() === trimmedName.toLowerCase(),
      )
    ) {
      nextErrors.name = "يوجد حساب بنفس الاسم بالفعل";
    }

    if (!formData.type) nextErrors.type = "نوع الحساب مطلوب";
    if (formData.balance === "") {
      nextErrors.balance = "الرصيد الابتدائي مطلوب";
    } else if (Number.isNaN(Number(formData.balance))) {
      nextErrors.balance = "الرصيد لازم يكون رقم";
    }
    if (!formData.currency.trim()) nextErrors.currency = "العملة مطلوبة";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError("");
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const { data: result } = await axiosClient.post("/accounts", {
        name: formData.name.trim(),
        type: formData.type,
        balance: Number(formData.balance),
        currency: formData.currency.trim(),
        color: formData.color,
      });

      onAccountCreated?.(result.data);
      setFormData({ name: "", type: "", balance: "", currency: "", color: DEFAULT_COLOR });
    } catch (error) {
      const response = error.response;
      const message = response?.data?.message || "حدث خطأ أثناء إضافة الحساب";

      if (response?.status === 409 || /موجود بالفعل|already exists/i.test(message)) {
        setErrors((previous) => ({ ...previous, name: "يوجد حساب بنفس الاسم بالفعل" }));
      } else if (response?.data?.code === "TRIAL_LIMIT_1_ACCOUNT") {
        setServerError("وصلت للحد الأقصى لحسابات النسخة التجريبية. رقّي حسابك لإضافة أكتر.");
      } else if (!response) {
        setServerError("تعذر الاتصال بالسيرفر، حاول مرة أخرى");
      } else {
        setServerError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-account-form" noValidate>
      <h2>إضافة حساب أو محفظة</h2>

      {serverError && <div className="form-error-banner">{serverError}</div>}

      <div className="form-field">
        <label htmlFor="account-name">الاسم</label>
        <input id="account-name" type="text" value={formData.name} onChange={handleChange("name")} maxLength={100} placeholder="مثال: حساب البنك الأهلي" />
        {errors.name && <span className="field-error">{errors.name}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="account-type">النوع</label>
        <select id="account-type" value={formData.type} onChange={handleChange("type")}>
          <option value="">اختر النوع</option>
          {ACCOUNT_TYPES.map((accountType) => <option key={accountType.value} value={accountType.value}>{accountType.label}</option>)}
        </select>
        {errors.type && <span className="field-error">{errors.type}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="account-balance">الرصيد الابتدائي</label>
        <input id="account-balance" type="number" step="0.01" value={formData.balance} onChange={handleChange("balance")} placeholder="0.00" />
        {errors.balance && <span className="field-error">{errors.balance}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="account-currency">العملة</label>
        <input id="account-currency" type="text" value={formData.currency} onChange={handleChange("currency")} maxLength={10} placeholder="مثال: EGP" />
        {errors.currency && <span className="field-error">{errors.currency}</span>}
      </div>

      <div className="form-field">
        <label htmlFor="account-color">اللون (اختياري)</label>
        <input id="account-color" type="color" value={formData.color} onChange={handleChange("color")} />
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "جارٍ الحفظ..." : "حفظ الحساب"}
      </button>
    </form>
  );
}

export default AddAccountForm;