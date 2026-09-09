import { Link } from "react-router-dom";

function CashPage() {
  return (
    <div>
      <h1>الكاش</h1>
      <p>الصفحة دي قيد الإنشاء.</p>
      <p>
        <Link to="/dashboard">الرجوع للوحة التحكم</Link>
      </p>
    </div>
  );
}

export default CashPage;
