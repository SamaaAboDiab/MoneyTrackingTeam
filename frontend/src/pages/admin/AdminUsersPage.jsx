import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { Ban, Check, CircleCheck, Plus, RefreshCw, Search, Users, X } from "lucide-react";
import {
  activateAdminUser,
  createAdminUser,
  fetchAdminUsers,
  suspendAdminUser,
  updateAdminUserSubscription,
} from "../../api/adminUsersApi";
import PageHeader from "../../components/common/PageHeader";

const PAGE_SIZE = 20;
const STATUSES = ["all", "active", "expiring", "expired", "suspended"];
const STATUS_STYLES = {
  active: "bg-emerald-50 text-emerald-700",
  expiring: "bg-amber-50 text-amber-700",
  expired: "bg-slate-100 text-slate-700",
  suspended: "bg-red-50 text-red-700",
};
const PLANS = ["all", "trial", "3months", "6months", "yearly", "custom"];
const EMPTY_CREATE_FORM = {
  name: "",
  email: "",
  password: "",
  subscriptionType: "trial",
  customDays: "30",
};
const EMPTY_PLAN_FORM = { subscriptionType: "trial", customDays: "30" };

function AdminUsersPage() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") ?? "";
  const initialStatus = STATUSES.includes(searchParams.get("status")) ? searchParams.get("status") : "all";
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, pages: 0 });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState(initialStatus);
  const [plan, setPlan] = useState("all");
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [search, setSearch] = useState(initialSearch);
  const [request, setRequest] = useState({ key: "", status: "loading", error: "" });
  const [reloadKey, setReloadKey] = useState(0);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [createStatus, setCreateStatus] = useState("idle");
  const [createError, setCreateError] = useState("");
  const [creationNotice, setCreationNotice] = useState({ type: "", message: "" });
  const [editingUser, setEditingUser] = useState(null);
  const [planForm, setPlanForm] = useState(EMPTY_PLAN_FORM);
  const [planStatus, setPlanStatus] = useState("idle");
  const [planError, setPlanError] = useState("");
  const [extendingUser, setExtendingUser] = useState(null);
  const [extensionDays, setExtensionDays] = useState("30");
  const [extensionStatus, setExtensionStatus] = useState("idle");
  const [extensionError, setExtensionError] = useState("");
  const [freeDaysUser, setFreeDaysUser] = useState(null);
  const [freeDays, setFreeDays] = useState("7");
  const [freeDaysReason, setFreeDaysReason] = useState("");
  const [freeDaysStatus, setFreeDaysStatus] = useState("idle");
  const [freeDaysError, setFreeDaysError] = useState("");
  const [manualDateUser, setManualDateUser] = useState(null);
  const [manualEndDate, setManualEndDate] = useState("");
  const [manualDateReason, setManualDateReason] = useState("");
  const [manualDateStatus, setManualDateStatus] = useState("idle");
  const [manualDateError, setManualDateError] = useState("");
  const [suspendingUser, setSuspendingUser] = useState(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendStatus, setSuspendStatus] = useState("idle");
  const [suspendError, setSuspendError] = useState("");
  const [activatingUserId, setActivatingUserId] = useState("");
  const requestKey = JSON.stringify({ page, search, plan, status, reloadKey });
  const isLoading = request.key !== requestKey || request.status === "loading";

  useEffect(() => {
    const controller = new AbortController();

    fetchAdminUsers({ page, limit: PAGE_SIZE, search, plan, status }, { signal: controller.signal })
      .then(({ data }) => {
        setUsers(data.data);
        setPagination(data.pagination);
        setRequest({ key: requestKey, status: "succeeded", error: "" });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setRequest({
          key: requestKey,
          status: "failed",
          error: error.response?.data?.message ?? t("admin.users.loadError"),
        });
      });

    return () => controller.abort();
  }, [page, plan, reloadKey, requestKey, search, status, t]);

  const applySearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleCreateChange = ({ target }) => {
    setCreateForm((previous) => ({ ...previous, [target.name]: target.value }));
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setCreateStatus("loading");
    setCreateError("");
    setCreationNotice({ type: "", message: "" });

    try {
      const { data } = await createAdminUser({
        ...createForm,
        customDays: Number(createForm.customDays),
      });
      setCreationNotice({
        type: data.setupEmailSent ? "success" : "warning",
        message: data.setupEmailSent
          ? t("admin.users.createSuccess")
          : t("admin.users.createEmailFailed"),
      });
      setCreateForm(EMPTY_CREATE_FORM);
      setCreateStatus("idle");
      setShowCreateForm(false);
      setPage(1);
      setSearch("");
      setSearchInput("");
      setStatus("all");
      setPlan("all");
      setReloadKey((current) => current + 1);
    } catch (error) {
      setCreateError(error.response?.data?.message ?? t("admin.users.createError"));
      setCreateStatus("failed");
    }
  };

  const openPlanEditor = (user) => {
    setEditingUser(user);
    setPlanForm({ ...EMPTY_PLAN_FORM, subscriptionType: user.subscriptionType ?? "trial" });
    setPlanError("");
    setPlanStatus("idle");
    setCreationNotice({ type: "", message: "" });
  };

  const handlePlanChange = ({ target }) => {
    setPlanForm((previous) => ({ ...previous, [target.name]: target.value }));
  };

  const handleUpdatePlan = async (event) => {
    event.preventDefault();
    if (!editingUser) return;
    setPlanStatus("loading");
    setPlanError("");

    try {
      const { data } = await updateAdminUserSubscription(editingUser._id, {
        subscriptionType: planForm.subscriptionType,
        customDays: Number(planForm.customDays),
      });
      const updatedUser = data.data;
      setUsers((current) => current.map((user) => (
        user._id === updatedUser._id ? updatedUser : user
      )));
      setCreationNotice({
        type: "success",
        message: t("admin.users.planUpdated", {
          name: updatedUser.name,
          oldDate: formatDate(editingUser.subscriptionEnd),
          newDate: formatDate(updatedUser.subscriptionEnd),
        }),
      });
      setEditingUser(null);
      setPlanStatus("idle");
      setReloadKey((current) => current + 1);
    } catch (error) {
      setPlanError(error.response?.data?.message ?? t("admin.users.planUpdateError"));
      setPlanStatus("failed");
    }
  };

  const openExtensionForm = (user) => {
    setExtendingUser(user);
    setExtensionDays("30");
    setExtensionError("");
    setExtensionStatus("idle");
    setCreationNotice({ type: "", message: "" });
  };

  const handleExtendSubscription = async (event) => {
    event.preventDefault();
    if (!extendingUser) return;
    setExtensionStatus("loading");
    setExtensionError("");

    try {
      const { data } = await updateAdminUserSubscription(extendingUser._id, {
        extensionDays: Number(extensionDays),
      });
      const updatedUser = data.data;
      setUsers((current) => current.map((user) => (
        user._id === updatedUser._id ? updatedUser : user
      )));
      setCreationNotice({
        type: "success",
        message: t("admin.users.subscriptionExtended", {
          name: updatedUser.name,
          days: Number(extensionDays),
          oldDate: formatDate(extendingUser.subscriptionEnd),
          newDate: formatDate(updatedUser.subscriptionEnd),
        }),
      });
      setExtendingUser(null);
      setExtensionStatus("idle");
      setReloadKey((current) => current + 1);
    } catch (error) {
      setExtensionError(error.response?.data?.message ?? t("admin.users.extendError"));
      setExtensionStatus("failed");
    }
  };

  const openFreeDaysForm = (user) => {
    setFreeDaysUser(user);
    setFreeDays("7");
    setFreeDaysReason("");
    setFreeDaysError("");
    setFreeDaysStatus("idle");
    setCreationNotice({ type: "", message: "" });
  };

  const handleAddFreeDays = async (event) => {
    event.preventDefault();
    if (!freeDaysUser) return;
    setFreeDaysStatus("loading");
    setFreeDaysError("");

    try {
      const days = Number(freeDays);
      const { data } = await updateAdminUserSubscription(freeDaysUser._id, {
        freeDays: days,
        reason: freeDaysReason.trim() || undefined,
      });
      const updatedUser = data.data;
      setUsers((current) => current.map((user) => (
        user._id === updatedUser._id ? updatedUser : user
      )));
      setCreationNotice({
        type: "success",
        message: t("admin.users.freeDaysAdded", {
          name: updatedUser.name,
          days,
          oldDate: formatDate(freeDaysUser.subscriptionEnd),
          newDate: formatDate(updatedUser.subscriptionEnd),
        }),
      });
      setFreeDaysUser(null);
      setFreeDaysStatus("idle");
      setReloadKey((current) => current + 1);
    } catch (error) {
      setFreeDaysError(error.response?.data?.message ?? t("admin.users.freeDaysError"));
      setFreeDaysStatus("failed");
    }
  };

  const openManualDateForm = (user) => {
    setManualDateUser(user);
    setManualEndDate(user.subscriptionEnd ? new Date(user.subscriptionEnd).toISOString().slice(0, 10) : "");
    setManualDateReason("");
    setManualDateError("");
    setManualDateStatus("idle");
    setCreationNotice({ type: "", message: "" });
  };

  const handleSetManualEndDate = async (event) => {
    event.preventDefault();
    if (!manualDateUser) return;
    if (!manualEndDate || !manualDateReason.trim()) {
      setManualDateError(t("admin.users.manualDateRequired"));
      setManualDateStatus("failed");
      return;
    }
    setManualDateStatus("loading");
    setManualDateError("");

    try {
      const { data } = await updateAdminUserSubscription(manualDateUser._id, {
        subscriptionEnd: manualEndDate,
        reason: manualDateReason.trim(),
      });
      const updatedUser = data.data;
      setUsers((current) => current.map((user) => (
        user._id === updatedUser._id ? updatedUser : user
      )));
      setCreationNotice({
        type: "success",
        message: t("admin.users.manualDateUpdated", {
          name: updatedUser.name,
          oldDate: formatDate(manualDateUser.subscriptionEnd),
          newDate: formatDate(updatedUser.subscriptionEnd),
        }),
      });
      setManualDateUser(null);
      setManualDateStatus("idle");
      setReloadKey((current) => current + 1);
    } catch (error) {
      setManualDateError(error.response?.data?.message ?? t("admin.users.manualDateError"));
      setManualDateStatus("failed");
    }
  };

  const openSuspendForm = (user) => {
    setSuspendingUser(user);
    setSuspendReason("");
    setSuspendError("");
    setSuspendStatus("idle");
    setCreationNotice({ type: "", message: "" });
  };

  const handleSuspendUser = async (event) => {
    event.preventDefault();
    if (!suspendingUser) return;
    const reason = suspendReason.trim();
    if (!reason) {
      setSuspendError(t("admin.users.suspendReasonRequired"));
      setSuspendStatus("failed");
      return;
    }

    setSuspendStatus("loading");
    setSuspendError("");
    try {
      const { data } = await suspendAdminUser(suspendingUser._id, reason);
      const updatedUser = data.data;
      setUsers((current) => current.map((user) => (
        user._id === updatedUser._id ? updatedUser : user
      )));
      setCreationNotice({
        type: "success",
        message: t("admin.users.suspendSuccess", { name: updatedUser.name }),
      });
      setSuspendingUser(null);
      setSuspendStatus("idle");
      setReloadKey((current) => current + 1);
    } catch (error) {
      setSuspendError(error.response?.data?.message ?? t("admin.users.suspendError"));
      setSuspendStatus("failed");
    }
  };

  const handleActivateUser = async (user) => {
    setActivatingUserId(user._id);
    setCreationNotice({ type: "", message: "" });
    try {
      const { data } = await activateAdminUser(user._id);
      const updatedUser = data.data;
      setUsers((current) => current.map((currentUser) => (
        currentUser._id === updatedUser._id ? updatedUser : currentUser
      )));
      setCreationNotice({
        type: "success",
        message: t("admin.users.activateSuccess", {
          name: updatedUser.name,
          status: t(`admin.users.status.${updatedUser._status}`),
        }),
      });
      setReloadKey((current) => current + 1);
    } catch (error) {
      setCreationNotice({
        type: "warning",
        message: error.response?.data?.message ?? t("admin.users.activateError"),
      });
    } finally {
      setActivatingUserId("");
    }
  };

  const formatDate = (value) => {
    if (!value) return t("admin.users.noEndDate");
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return t("admin.users.noEndDate");
    return new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" }).format(date);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        icon={Users}
        title={t("admin.users.title")}
        subtitle={t("admin.users.subtitle")}
        actions={
          <button
            type="button"
            onClick={() => {
              setShowCreateForm((current) => !current);
              setCreateError("");
              setCreationNotice({ type: "", message: "" });
            }}
            aria-expanded={showCreateForm}
            aria-controls="admin-create-user"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700"
          >
            <Plus size={17} />
            {t("admin.users.createAction")}
          </button>
        }
      />

      {creationNotice.message && (
        <div
          role="status"
          className={`mb-4 rounded-xl p-4 text-sm font-medium ${creationNotice.type === "warning" ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"}`}
        >
          {creationNotice.message}
        </div>
      )}

      {showCreateForm && (
        <section id="admin-create-user" className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-4 text-lg font-extrabold text-slate-900">{t("admin.users.createTitle")}</h2>
          <form onSubmit={handleCreateUser} className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">
              {t("admin.users.name")}
              <input
                name="name"
                required
                maxLength={120}
                autoComplete="name"
                value={createForm.name}
                onChange={handleCreateChange}
                className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-brand-500"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              {t("admin.users.email")}
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                dir="ltr"
                value={createForm.email}
                onChange={handleCreateChange}
                className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-start font-normal outline-none focus:border-brand-500"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              {t("admin.users.password")}
              <input
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={createForm.password}
                onChange={handleCreateChange}
                className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-brand-500"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              {t("admin.users.planFilter")}
              <select
                name="subscriptionType"
                value={createForm.subscriptionType}
                onChange={handleCreateChange}
                className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 font-normal outline-none focus:border-brand-500"
              >
                {PLANS.filter((value) => value !== "all").map((value) => (
                  <option key={value} value={value}>{t(`admin.users.plan.${value}`)}</option>
                ))}
              </select>
            </label>
            {createForm.subscriptionType === "custom" && (
              <label className="text-sm font-semibold text-slate-700">
                {t("admin.users.customDays")}
                <input
                  name="customDays"
                  type="number"
                  min={1}
                  max={3650}
                  required
                  value={createForm.customDays}
                  onChange={handleCreateChange}
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-brand-500"
                />
              </label>
            )}
            {createError && (
              <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700 sm:col-span-2">
                {createError}
              </div>
            )}
            <div className="flex gap-2 sm:col-span-2">
              <button
                type="submit"
                disabled={createStatus === "loading"}
                className="min-h-11 rounded-xl bg-brand-600 px-4 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-60"
              >
                {createStatus === "loading" ? t("admin.users.creating") : t("admin.users.createSubmit")}
              </button>
              <button
                type="button"
                onClick={() => { setShowCreateForm(false); setCreateError(""); }}
                className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {t("common.cancel")}
              </button>
            </div>
          </form>
        </section>
      )}

      {editingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && planStatus !== "loading") setEditingUser(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-change-plan-title"
            className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 id="admin-change-plan-title" className="text-lg font-extrabold text-slate-900">
                  {t("admin.users.changePlanTitle")}
                </h2>
                <p className="mt-1 text-sm text-slate-500">{editingUser.name}</p>
              </div>
              <button
                type="button"
                aria-label={t("common.close")}
                disabled={planStatus === "loading"}
                onClick={() => setEditingUser(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdatePlan} className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">
                {t("admin.users.newPlan")}
                <select
                  name="subscriptionType"
                  value={planForm.subscriptionType}
                  onChange={handlePlanChange}
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 font-normal outline-none focus:border-brand-500"
                >
                  {PLANS.filter((value) => value !== "all").map((value) => (
                    <option key={value} value={value}>{t(`admin.users.plan.${value}`)}</option>
                  ))}
                </select>
              </label>
              {planForm.subscriptionType === "custom" && (
                <label className="block text-sm font-semibold text-slate-700">
                  {t("admin.users.customDays")}
                  <input
                    name="customDays"
                    type="number"
                    min={1}
                    max={3650}
                    required
                    value={planForm.customDays}
                    onChange={handlePlanChange}
                    className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-brand-500"
                  />
                </label>
              )}
              <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                <p>{t("admin.users.currentPlan", { plan: t(`admin.users.plan.${editingUser.subscriptionType}`) })}</p>
                <p className="mt-1">{t("admin.users.currentEndDate", { date: formatDate(editingUser.subscriptionEnd) })}</p>
              </div>
              {planError && (
                <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
                  {planError}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  disabled={planStatus === "loading"}
                  onClick={() => setEditingUser(null)}
                  className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={planStatus === "loading"}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-bold text-white hover:bg-brand-700 disabled:cursor-wait disabled:opacity-60"
                >
                  <Check size={16} />
                  {planStatus === "loading" ? t("admin.users.savingPlan") : t("admin.users.savePlan")}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {extendingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && extensionStatus !== "loading") setExtendingUser(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-extend-subscription-title"
            className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 id="admin-extend-subscription-title" className="text-lg font-extrabold text-slate-900">
                  {t("admin.users.extendTitle")}
                </h2>
                <p className="mt-1 text-sm text-slate-500">{extendingUser.name}</p>
              </div>
              <button
                type="button"
                aria-label={t("common.close")}
                disabled={extensionStatus === "loading"}
                onClick={() => setExtendingUser(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleExtendSubscription} className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">
                {t("admin.users.extensionDays")}
                <input
                  name="extensionDays"
                  type="number"
                  min={1}
                  max={3650}
                  required
                  value={extensionDays}
                  onChange={(event) => setExtensionDays(event.target.value)}
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-brand-500"
                />
              </label>
              <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                <p>{t("admin.users.currentEndDate", { date: formatDate(extendingUser.subscriptionEnd) })}</p>
                <p className="mt-1">{t("admin.users.extensionRule")}</p>
              </div>
              {extensionError && (
                <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
                  {extensionError}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  disabled={extensionStatus === "loading"}
                  onClick={() => setExtendingUser(null)}
                  className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={extensionStatus === "loading"}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-bold text-white hover:bg-brand-700 disabled:cursor-wait disabled:opacity-60"
                >
                  <RefreshCw size={16} />
                  {extensionStatus === "loading" ? t("admin.users.extending") : t("admin.users.extendSubmit")}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {freeDaysUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && freeDaysStatus !== "loading") setFreeDaysUser(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-free-days-title"
            className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 id="admin-free-days-title" className="text-lg font-extrabold text-slate-900">
                  {t("admin.users.freeDaysTitle")}
                </h2>
                <p className="mt-1 text-sm text-slate-500">{freeDaysUser.name}</p>
              </div>
              <button
                type="button"
                aria-label={t("common.close")}
                disabled={freeDaysStatus === "loading"}
                onClick={() => setFreeDaysUser(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddFreeDays} className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">
                {t("admin.users.freeDaysCount")}
                <input
                  name="freeDays"
                  type="number"
                  min={1}
                  required
                  value={freeDays}
                  onChange={(event) => setFreeDays(event.target.value)}
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-brand-500"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                {t("admin.users.reason")}
                <textarea
                  name="reason"
                  maxLength={500}
                  rows={3}
                  value={freeDaysReason}
                  onChange={(event) => setFreeDaysReason(event.target.value)}
                  className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 px-3 py-2 font-normal outline-none focus:border-brand-500"
                />
              </label>
              <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                <p>{t("admin.users.currentEndDate", { date: formatDate(freeDaysUser.subscriptionEnd) })}</p>
                <p className="mt-1">{t("admin.users.freeDaysRule")}</p>
              </div>
              {freeDaysError && (
                <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
                  {freeDaysError}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  disabled={freeDaysStatus === "loading"}
                  onClick={() => setFreeDaysUser(null)}
                  className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={freeDaysStatus === "loading"}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-bold text-white hover:bg-brand-700 disabled:cursor-wait disabled:opacity-60"
                >
                  <Plus size={16} />
                  {freeDaysStatus === "loading" ? t("admin.users.addingFreeDays") : t("admin.users.addFreeDays")}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {manualDateUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && manualDateStatus !== "loading") setManualDateUser(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-manual-date-title"
            className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 id="admin-manual-date-title" className="text-lg font-extrabold text-slate-900">
                  {t("admin.users.manualDateTitle")}
                </h2>
                <p className="mt-1 text-sm text-slate-500">{manualDateUser.name}</p>
              </div>
              <button
                type="button"
                aria-label={t("common.close")}
                disabled={manualDateStatus === "loading"}
                onClick={() => setManualDateUser(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSetManualEndDate} className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">
                {t("admin.users.manualEndDate")}
                <input
                  name="subscriptionEnd"
                  type="date"
                  required
                  value={manualEndDate}
                  onChange={(event) => setManualEndDate(event.target.value)}
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3 font-normal outline-none focus:border-brand-500"
                />
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                {t("admin.users.manualDateReason")}
                <textarea
                  name="reason"
                  required
                  maxLength={500}
                  rows={3}
                  value={manualDateReason}
                  onChange={(event) => setManualDateReason(event.target.value)}
                  className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 px-3 py-2 font-normal outline-none focus:border-brand-500"
                />
              </label>
              {manualDateError && (
                <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
                  {manualDateError}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  disabled={manualDateStatus === "loading"}
                  onClick={() => setManualDateUser(null)}
                  className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={manualDateStatus === "loading"}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-bold text-white hover:bg-brand-700 disabled:cursor-wait disabled:opacity-60"
                >
                  <Check size={16} />
                  {manualDateStatus === "loading" ? t("admin.users.savingManualDate") : t("admin.users.saveManualDate")}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {suspendingUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && suspendStatus !== "loading") setSuspendingUser(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-suspend-title"
            className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 id="admin-suspend-title" className="text-lg font-extrabold text-slate-900">
                  {t("admin.users.suspendTitle")}
                </h2>
                <p className="mt-1 text-sm text-slate-500">{suspendingUser.name}</p>
              </div>
              <button
                type="button"
                aria-label={t("common.close")}
                disabled={suspendStatus === "loading"}
                onClick={() => setSuspendingUser(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSuspendUser} className="space-y-4">
              <div className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
                {t("admin.users.suspendWarning")}
              </div>
              <label className="block text-sm font-semibold text-slate-700">
                {t("admin.users.suspendReason")}
                <textarea
                  name="reason"
                  required
                  maxLength={500}
                  rows={3}
                  value={suspendReason}
                  onChange={(event) => setSuspendReason(event.target.value)}
                  className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 px-3 py-2 font-normal outline-none focus:border-red-500"
                />
              </label>
              {suspendError && (
                <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
                  {suspendError}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  disabled={suspendStatus === "loading"}
                  onClick={() => setSuspendingUser(null)}
                  className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={suspendStatus === "loading"}
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
                >
                  <Ban size={16} />
                  {suspendStatus === "loading" ? t("admin.users.suspending") : t("admin.users.confirmSuspend")}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <form onSubmit={applySearch} className="flex w-full gap-2 lg:max-w-md">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">{t("admin.users.search")}</span>
              <Search size={17} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                maxLength={100}
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={t("admin.users.search")}
                className="min-h-11 w-full rounded-xl border border-slate-200 ps-10 pe-3 text-sm outline-none transition focus:border-brand-500"
              />
            </label>
            <button
              type="submit"
              className="min-h-11 rounded-xl bg-brand-600 px-4 text-sm font-bold text-white transition hover:bg-brand-700"
            >
              {t("admin.users.searchAction")}
            </button>
          </form>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="sr-only" htmlFor="admin-user-status">{t("admin.users.statusFilter")}</label>
            <select
              id="admin-user-status"
              value={status}
              onChange={(event) => { setStatus(event.target.value); setPage(1); }}
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-brand-500"
            >
              {STATUSES.map((value) => (
                <option key={value} value={value}>{t(`admin.users.status.${value}`)}</option>
              ))}
            </select>
            <label className="sr-only" htmlFor="admin-user-plan">{t("admin.users.planFilter")}</label>
            <select
              id="admin-user-plan"
              value={plan}
              onChange={(event) => { setPlan(event.target.value); setPage(1); }}
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-brand-500"
            >
              {PLANS.map((value) => (
                <option key={value} value={value}>{t(`admin.users.plan.${value}`)}</option>
              ))}
            </select>
          </div>
        </div>

        <p className="mb-3 text-sm text-slate-500" aria-live="polite">
          {t("admin.users.total", { count: pagination.total })}
        </p>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-slate-500">{t("common.loading")}</div>
        ) : request.status === "failed" ? (
          <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">{request.error}</div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">{t("admin.users.empty")}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-start text-sm">
              <thead className="border-b border-slate-200 text-xs font-bold text-slate-500">
                <tr>
                  <th scope="col" className="px-3 py-3">{t("admin.users.name")}</th>
                  <th scope="col" className="px-3 py-3">{t("admin.users.email")}</th>
                  <th scope="col" className="px-3 py-3">{t("admin.users.subscription")}</th>
                  <th scope="col" className="px-3 py-3">{t("admin.users.subscriptionEnd")}</th>
                  <th scope="col" className="px-3 py-3">{t("admin.users.statusLabel")}</th>
                  <th scope="col" className="px-3 py-3">{t("admin.users.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user._id} className="text-slate-700">
                    <td className="px-3 py-4 font-semibold text-slate-900">{user.name}</td>
                    <td dir="ltr" className="px-3 py-4 text-start">{user.email}</td>
                    <td className="px-3 py-4">{t(`admin.users.plan.${user.subscriptionType}`, { defaultValue: user.subscriptionType })}</td>
                    <td className="px-3 py-4">{formatDate(user.subscriptionEnd)}</td>
                    <td className="px-3 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[user._status] ?? STATUS_STYLES.active}`}>
                        {t(`admin.users.status.${user._status}`)}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openPlanEditor(user)}
                          className="whitespace-nowrap rounded-lg border border-brand-200 px-3 py-2 text-xs font-bold text-brand-700 transition hover:bg-brand-50"
                        >
                          {t("admin.users.changePlan")}
                        </button>
                        <button
                          type="button"
                          onClick={() => openExtensionForm(user)}
                          className="whitespace-nowrap rounded-lg border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50"
                        >
                          {t("admin.users.extendSubscription")}
                        </button>
                        <button
                          type="button"
                          onClick={() => openFreeDaysForm(user)}
                          className="whitespace-nowrap rounded-lg border border-amber-200 px-3 py-2 text-xs font-bold text-amber-700 transition hover:bg-amber-50"
                        >
                          {t("admin.users.addFreeDays")}
                        </button>
                        <button
                          type="button"
                          onClick={() => openManualDateForm(user)}
                          className="whitespace-nowrap rounded-lg border border-violet-200 px-3 py-2 text-xs font-bold text-violet-700 transition hover:bg-violet-50"
                        >
                          {t("admin.users.setManualDate")}
                        </button>
                        {user.isSuspended ? (
                          <button
                            type="button"
                            onClick={() => handleActivateUser(user)}
                            disabled={activatingUserId === user._id}
                            className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-wait disabled:opacity-60"
                          >
                            <CircleCheck size={14} />
                            {activatingUserId === user._id
                              ? t("admin.users.activating")
                              : t("admin.users.activate")}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openSuspendForm(user)}
                            className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-50"
                          >
                            <Ban size={14} />
                            {t("admin.users.suspend")}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && request.status === "succeeded" && pagination.pages > 1 && (
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
              className="min-h-10 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("admin.users.previous")}
            </button>
            <span className="text-sm text-slate-500">
              {t("admin.users.page", { page: pagination.page, pages: pagination.pages })}
            </span>
            <button
              type="button"
              disabled={page >= pagination.pages}
              onClick={() => setPage((current) => current + 1)}
              className="min-h-10 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("admin.users.next")}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminUsersPage;
