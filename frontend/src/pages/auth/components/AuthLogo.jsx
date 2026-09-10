import { Wallet } from "lucide-react";

function AuthLogo({ title }) {
  return (
    <div className="mb-4 flex flex-col items-center text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
        <Wallet size={22} strokeWidth={2.25} />
      </span>
      <h1 className="mt-3 text-2xl font-extrabold text-slate-900">{title}</h1>
    </div>
  );
}

export default AuthLogo;
