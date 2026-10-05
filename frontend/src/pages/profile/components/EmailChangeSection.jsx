import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  requestEmailChange,
  confirmEmailChange,
  resetEmailChangeState,
} from "../../../store/slices/authSlice";
import { localizeDigits, normalizeDigits } from "../../../utils/formatAmount";

const inputClass =
  "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand-500";
const labelClass = "text-sm font-semibold text-slate-700";
const errorClass = "rounded-xl bg-expense-soft px-4 py-2.5 text-sm font-medium text-expense";
const successClass = "rounded-xl bg-income-soft px-4 py-2.5 text-sm font-medium text-income";

function EmailChangeSection({ t }) {
  const dispatch = useDispatch();
  const { emailRequestStatus, emailRequestError, emailConfirmStatus, emailConfirmError } = useSelector(
    (state) => state.auth
  );
  const [open, setOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [code, setCode] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const codeSent = emailRequestStatus === "succeeded" && !confirmed;

  const close = () => {
    setOpen(false);
    setNewEmail("");
    setCode("");
    setConfirmed(false);
    dispatch(resetEmailChangeState());
  };

  const handleRequestCode = async (event) => {
    event.preventDefault();
    await dispatch(requestEmailChange(newEmail.trim()));
  };

  const handleConfirmCode = async (event) => {
    event.preventDefault();
    const result = await dispatch(confirmEmailChange(code.trim()));
    if (confirmEmailChange.fulfilled.match(result)) setConfirmed(true);
  };

  return (
    <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm shadow-slate-200 ring-1 ring-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{t("profile.email.title")}</h2>
          <p className="mt-1 text-sm text-slate-500">{t("profile.email.subtitle")}</p>
        </div>
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
          >
            {t("profile.email.changeEmail")}
          </button>
        )}
      </div>

      {open && (
        <div className="mt-5">
          {confirmed ? (
            <p className={successClass}>{t("profile.email.changeSuccess")}</p>
          ) : codeSent ? (
            <form onSubmit={handleConfirmCode} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <p className="text-sm text-slate-600 sm:col-span-2">{t("profile.email.codeSentMessage")}</p>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email-code" className={labelClass}>
                  {t("profile.email.codeLabel")}
                </label>
                <input
                  id="email-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={localizeDigits(code)}
                  onChange={(event) => setCode(normalizeDigits(event.target.value).replace(/\D/g, "").slice(0, 6))}
                  required
                  className={inputClass}
                />
              </div>
              <div className="flex items-end gap-3 sm:col-span-2">
                {emailConfirmError && <p className={errorClass}>{emailConfirmError}</p>}
                <button
                  type="submit"
                  disabled={emailConfirmStatus === "loading"}
                  className="ms-auto rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-65"
                >
                  {emailConfirmStatus === "loading" ? t("profile.email.confirming") : t("profile.email.confirm")}
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
                >
                  {t("profile.email.cancel")}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRequestCode} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="new-email" className={labelClass}>
                  {t("profile.email.newEmailLabel")}
                </label>
                <input
                  id="new-email"
                  type="email"
                  dir="ltr"
                  value={newEmail}
                  onChange={(event) => setNewEmail(event.target.value)}
                  required
                  className={inputClass}
                />
              </div>
              <div className="flex items-end gap-3 sm:col-span-2">
                {emailRequestError && <p className={errorClass}>{emailRequestError}</p>}
                <button
                  type="submit"
                  disabled={emailRequestStatus === "loading"}
                  className="ms-auto rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-65"
                >
                  {emailRequestStatus === "loading" ? t("profile.email.sending") : t("profile.email.sendCode")}
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
                >
                  {t("profile.email.cancel")}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </section>
  );
}

export default EmailChangeSection;
