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
import TransferForm from "./components/TransferForm";

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
    <div className="mx-auto max-w-lg">
      <p>
        <Link to="/dashboard" className="font-semibold text-brand-700 hover:underline">
          {t("transfer.backToDashboard")}
        </Link>
      </p>
      <TransferForm form={form} accounts={activeAccounts} status={status} error={transferError || error} formError={formError} lastTransfer={lastTransfer} transferStatus={transferStatus} onChange={handleChange} onSubmit={handleSubmit} t={t} />
    </div>
  );
}

export default TransferPage;
