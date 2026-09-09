import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  fetchAccounts,
  transferFunds,
  clearTransferError,
  resetTransferStatus,
} from "../../store/slices/accountsSlice";
import "../../app/App.css";

function TransferPage() {
  const { t } = useTranslation();

  // بنستخدمه عشان نبعت Actions لـ Redux
  const dispatch = useDispatch();

  // البيانات الموجودة جوه accounts
  const { items, status, error, transferStatus, transferError } = useSelector(
    (state) => state.accounts
  );

  // بيخزن القيم اللي المستخدم بيكتبه
  const [form, setForm] = useState({
    fromId: "",
    toId: "",
    amount: "",
    description: "",
  });

  // لتخزين أخطاء الـ validation اللي بنعمله في الـ Component.
  const [formError, setFormError] = useState(null);

  // بيخزن آخر عملية تحويل نجحت وده هنستخدمه في رسالة النجاح.
  const [lastTransfer, setLastTransfer] = useState(null);

  // أول ما الصفحة تفتح، هاتي الحسابات من الـ API
  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  // بنستبعد الحسابات المعطلة
  // US-306 (Archive): an archived account must not be selectable for a transfer.
  const activeAccounts = useMemo(
    () => items.filter((a) => a.isActive !== false),
    [items]
  );

  // دي function بتشتغل لما المستخدم يغيّر أي input أو select.
  const handleChange = (e) => {
    // دي بتحدث قيمة الـ input.
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  //  دي function بتشتغل لما المستخدم يعمل Submit للفورم وكتبنا async لأننا هنعمل API request ونستنى نتيجته.
  const handleSubmit = async (e) => {
    // تمنع الـ form من عمل refresh للصفحة.
    e.preventDefault();
    // بنمسح أي خطأ قديم من الـ validation.{
    //   مثلاً لو المرة اللي فاتت ظهر {
    //     "المبلغ لازم يكون أكبر من صفر"
    //   }
    //   وبدأ المستخدم محاولة جديدة، نمسح الخطأ القديم.
    // }
    setFormError(null);
    // بنمسح بيانات آخر تحويل علشان رسالة النجاح القديمة تختفي قبل ما نبدأ تحويل جديد.
    setLastTransfer(null);
    // يعني تمسح خطأ التحويل القديم.
    dispatch(clearTransferError());
    dispatch(resetTransferStatus());

    if (!form.fromId || !form.toId) {
      setFormError(t("transfer.selectBothAccounts"));
      return;
    }

    if (form.fromId === form.toId) {
      setFormError(t("transfer.sameAccountError"));
      return;
    }
    const amountNum = Number(form.amount);
    if (!amountNum || amountNum <= 0) {
      setFormError(t("transfer.amountPositiveError"));
      return;
    }

    try {
      const payload = await dispatch(
        transferFunds({
          fromId: form.fromId,
          toId: form.toId,
          amount: amountNum,
          description: form.description || undefined,
        })
      ).unwrap();

      setLastTransfer(payload);
      setForm({ fromId: "", toId: "", amount: "", description: "" });
      dispatch(fetchAccounts());
    } catch {
      // transferError is already populated by the slice's rejected case
    }
  };

  return (
    <div>
      <p>
        <Link to="/dashboard">{t("transfer.backToDashboard")}</Link>
      </p>

      <form className="auth-form" onSubmit={handleSubmit} style={{ maxWidth: 420 }}>
        <h1>{t("transfer.title")}</h1>

        {status === "loading" && <p>{t("transfer.loadingAccounts")}</p>}
        {error && <p className="auth-error">{error}</p>}

        {status === "succeeded" && activeAccounts.length < 2 && (
          <p className="auth-error">{t("transfer.needTwoAccounts")}</p>
        )}

        {(formError || transferError) && (
          <p className="auth-error">{formError || transferError}</p>
        )}

        {transferStatus === "succeeded" && lastTransfer && (
          <p className="auth-success">
            {t("transfer.successMessage", {
              fromName: lastTransfer.from.name,
              fromBalance: lastTransfer.from.balance.toLocaleString(),
              fromCurrency: lastTransfer.from.currency,
              toName: lastTransfer.to.name,
              toBalance: lastTransfer.to.balance.toLocaleString(),
              toCurrency: lastTransfer.to.currency,
            })}
          </p>
        )}

        <label htmlFor="fromId">{t("transfer.fromLabel")}</label>
        <select id="fromId" name="fromId" value={form.fromId} onChange={handleChange}>
          <option value="">{t("transfer.fromPlaceholder")}</option>
          {activeAccounts.map((a) => (
            <option key={a._id} value={a._id}>
              {a.name} ({a.balance.toLocaleString()} {a.currency})
            </option>
          ))}
        </select>

        <label htmlFor="toId">{t("transfer.toLabel")}</label>
        <select id="toId" name="toId" value={form.toId} onChange={handleChange}>
          <option value="">{t("transfer.toPlaceholder")}</option>
          {activeAccounts.map((a) => (
            <option key={a._id} value={a._id}>
              {a.name} ({a.balance.toLocaleString()} {a.currency})
            </option>
          ))}
        </select>

        <label htmlFor="amount">{t("transfer.amountLabel")}</label>
        <input
          id="amount"
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          value={form.amount}
          onChange={handleChange}
          required
        />

        <label htmlFor="description">{t("transfer.descriptionLabel")}</label>
        <input
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
        />

        <button type="submit" disabled={transferStatus === "loading"}>
          {transferStatus === "loading"
            ? t("transfer.submitting")
            : t("transfer.submit")}
        </button>
      </form>
    </div>
  );
}

export default TransferPage;
