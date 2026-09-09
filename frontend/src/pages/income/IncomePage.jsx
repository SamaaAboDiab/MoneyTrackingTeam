import { Link } from "react-router-dom";

function IncomePage() {
  return (
    <div>
      <h1>الدخل</h1>
      <p>الصفحة دي قيد الإنشاء.</p>
      <p>
        <Link to="/dashboard">الرجوع للوحة التحكم</Link>
      </p>
    </div>
  );
}

export default IncomePage;
