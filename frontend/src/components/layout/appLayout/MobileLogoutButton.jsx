import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { LogOut } from "lucide-react";
import { logout } from "../../../store/slices/authSlice";
import ConfirmModal from "../../common/ConfirmModal";

function MobileLogoutButton() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={t("layout.logout")}
        title={t("layout.logout")}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 sm:hidden"
      >
        <LogOut size={18} />
      </button>

      <ConfirmModal
        isOpen={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={handleConfirm}
        confirmVariant="destructive"
        title={t("layout.logoutConfirmTitle")}
        description={t("layout.logoutConfirmMessage")}
        cancelLabel={t("layout.cancel")}
        confirmLabel={t("layout.logout")}
      />
    </>
  );
}

export default MobileLogoutButton;
