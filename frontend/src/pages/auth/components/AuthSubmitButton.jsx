function AuthSubmitButton({ loading, loadingLabel, label }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mx-auto mt-4 block min-h-11 w-[70%] max-w-56 rounded-full bg-brand-600 py-2.5 text-sm font-bold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? loadingLabel : label}
    </button>
  );
}

export default AuthSubmitButton;
