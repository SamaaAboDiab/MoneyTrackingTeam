function AuthSubmitButton({ loading, loadingLabel, label }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-4 w-full rounded-xl bg-brand-600 py-2.5 text-sm font-bold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? loadingLabel : label}
    </button>
  );
}

export default AuthSubmitButton;
