import { Link } from "react-router-dom";

function DebtsPage() {
  return (
    <div>
      <h1>الديون</h1>
      <p>الصفحة دي قيد الإنشاء.</p>
      <p>
        <Link to="/dashboard">الرجوع للوحة التحكم</Link>
      </p>
    </div>
  );
}

export default DebtsPage;
