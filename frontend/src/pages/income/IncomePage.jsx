import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchIncomes, updateIncomeEntry, clearIncomeUpdateError } from "../../store/slices/incomeSlice";

const EMPTY_FORM = {
  name: "",
  category: "salary",
  amount: "",
  currency: "EGP",
  receivedDate: "",
  recurrence: "once",
  status: "cleared",
  notes: "",
};

function formatMoney(value) {
  const num = Number(value || 0);
  return new Intl.NumberFormat("ar-EG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

function IncomePage() {
  const dispatch = useDispatch();
  const { items, status, error, updateStatus, updateError } = useSelector((state) => state.incomes);

  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    dispatch(fetchIncomes());
  }, [dispatch]);

  useEffect(() => {
    if (!updateError) return;
    const timer = setTimeout(() => dispatch(clearIncomeUpdateError()), 3000);
    return () => clearTimeout(timer);
  }, [updateError, dispatch]);

  const totalIncome = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [items]
  );

  const openEditModal = (income) => {
    setSelectedId(income._id);
    setForm({
      name: income.name || "",
      category: income.category || "salary",
      amount: income.amount ?? "",
      currency: income.currency || "EGP",
      receivedDate: income.receivedDate ? new Date(income.receivedDate).toISOString().slice(0, 10) : "",
      recurrence: income.recurrence || "once",
      status: income.status || "cleared",
      notes: income.notes || "",
    });
    setIsEditing(true);
    setSuccessMessage("");
  };

  const closeEditModal = () => {
    setIsEditing(false);
    setSelectedId(null);
    setForm(EMPTY_FORM);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      name: form.name.trim(),
      category: form.category,
      amount: Number(form.amount),
      currency: form.currency,
      receivedDate: form.receivedDate,
      recurrence: form.recurrence,
      status: form.status,
      notes: form.notes.trim(),
    };

    const result = await dispatch(
      updateIncomeEntry({ id: selectedId, payload })
    );

    if (updateIncomeEntry.fulfilled.match(result)) {
      setSuccessMessage("تم التعديل بنجاح");
      closeEditModal();
      dispatch(fetchIncomes());
    }
  };

  return (
    <div className="accounts-page">
      <div className="accounts-container">
        <div className="page-header">
          <div>
            <h1>مصادر الدخل</h1>
            <p className="accounts-page-subtitle">إدارة مصادر الدخل وتحديثها بسهولة</p>
          </div>

          <Link to="/dashboard" className="back-link">
            العودة للوحة التحكم
          </Link>
        </div>

        <section className="wealth-summary" style={{ marginBottom: 32 }}>
          <p className="wealth-summary-label">إجمالي الدخل</p>
          <div className="wealth-summary-values">
            <span>{formatMoney(totalIncome)} EGP</span>
          </div>
        </section>

        {error && <p className="auth-error">{error}</p>}
        {updateError && <p className="auth-error">{updateError}</p>}
        {successMessage && <p className="auth-success">{successMessage}</p>}

        {status === "loading" ? (
          <p>جارٍ تحميل مصادر الدخل...</p>
        ) : (
          <div className="transactions-list">
            {items.length === 0 ? (
              <p>لا توجد مصادر دخل مسجلة حاليًا.</p>
            ) : (
              items.map((income) => (
                <div key={income._id} className="transaction-row" style={{ gridTemplateColumns: "1.3fr 1fr 1fr 1fr auto" }}>
                  <div>
                    <span className="transaction-label">المصدر</span>
                    <strong>{income.name}</strong>
                  </div>
                  <div>
                    <span className="transaction-label">الفئة</span>
                    <span>{income.category}</span>
                  </div>
                  <div>
                    <span className="transaction-label">المبلغ</span>
                    <span className="transaction-amount-credit">{formatMoney(income.amount)} {income.currency || "EGP"}</span>
                  </div>
                  <div>
                    <span className="transaction-label">التاريخ</span>
                    <span>{new Date(income.receivedDate).toLocaleDateString("ar-EG")}</span>
                  </div>
                  <div>
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => openEditModal(income)}
                      style={{ padding: "8px 12px" }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {isEditing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "grid", placeItems: "center", padding: 16 }}>
          <div style={{ width: "min(100%, 560px)", background: "#fff", borderRadius: 12, padding: 24 }}>
            <h2 style={{ marginTop: 0 }}>تعديل مصدر الدخل</h2>

            <form onSubmit={handleSubmit} className="auth-form" style={{ maxWidth: "100%" }}>
              <label htmlFor="name">اسم المصدر</label>
              <input id="name" name="name" value={form.name} onChange={handleFormChange} required />

              <label htmlFor="category">الفئة</label>
              <select id="category" name="category" value={form.category} onChange={handleFormChange}>
                <option value="salary">راتب</option>
                <option value="freelance">عمل حر</option>
                <option value="rental">إيجار</option>
                <option value="investment">استثمار</option>
                <option value="other">أخرى</option>
              </select>

              <label htmlFor="amount">المبلغ</label>
              <input id="amount" name="amount" type="number" min="0" step="0.01" value={form.amount} onChange={handleFormChange} required />

              <label htmlFor="currency">العملة</label>
              <select id="currency" name="currency" value={form.currency} onChange={handleFormChange}>
                <option value="EGP">EGP</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>

              <label htmlFor="receivedDate">تاريخ الاستلام</label>
              <input id="receivedDate" name="receivedDate" type="date" value={form.receivedDate} onChange={handleFormChange} required />

              <label htmlFor="recurrence">التكرار</label>
              <select id="recurrence" name="recurrence" value={form.recurrence} onChange={handleFormChange}>
                <option value="once">مرة واحدة</option>
                <option value="weekly">أسبوعي</option>
                <option value="monthly">شهري</option>
                <option value="yearly">سنوي</option>
              </select>

              <label htmlFor="status">الحالة</label>
              <select id="status" name="status" value={form.status} onChange={handleFormChange}>
                <option value="cleared">مستلمة</option>
                <option value="pending">قيد الانتظار</option>
              </select>

              <label htmlFor="notes">ملاحظات</label>
              <textarea id="notes" name="notes" rows="3" value={form.notes} onChange={handleFormChange} />

              <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                <button type="submit" className="primary-button" disabled={updateStatus === "loading"}>
                  {updateStatus === "loading" ? "جارٍ الحفظ..." : "حفظ التعديلات"}
                </button>
                <button type="button" className="secondary-button" onClick={closeEditModal}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default IncomePage;
