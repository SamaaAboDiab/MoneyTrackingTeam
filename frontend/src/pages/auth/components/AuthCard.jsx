function AuthCard({ children, as: Component = "form", className = "", ...props }) {
  return (
    <div className="flex h-[calc(100vh-64px)] items-center justify-center overflow-y-auto px-4 py-4">
      <Component
        className={`w-full max-w-md rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/60 ring-1 ring-slate-100 ${className}`}
        {...props}
      >
        {children}
      </Component>
    </div>
  );
}

export default AuthCard;
