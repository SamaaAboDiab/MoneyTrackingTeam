function DashboardGreeting({ user, t }) {
  if (!user) return null;

  return (
    <div className="mb-6">
      <h1 className="text-xl font-extrabold text-slate-900">
        {t("dashboard.greeting", { name: user.name })}
      </h1>
    </div>
  );
}

export default DashboardGreeting;
