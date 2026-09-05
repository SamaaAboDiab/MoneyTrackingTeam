import { useSelector } from "react-redux";

function DashboardPage() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div>
      <h1>لوحة التحكم</h1>
      {user && <p>أهلاً، {user.name}</p>}
    </div>
  );
}

export default DashboardPage;
