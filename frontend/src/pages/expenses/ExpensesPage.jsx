import { Link } from "react-router-dom";

function ExpensesPage() {
  return (
    <div>
      <h1>المصروفات</h1>
      <p>الصفحة دي قيد الإنشاء.</p>
      <p>
        <Link to="/dashboard">الرجوع للوحة التحكم</Link>
      </p>
    </div>
  );
}

export default ExpensesPage;
