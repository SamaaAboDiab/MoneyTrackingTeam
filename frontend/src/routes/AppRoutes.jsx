import { Navigate, Route, Routes } from "react-router-dom";
import RegisterPage from "../pages/auth/RegisterPage";
import LoginPage from "../pages/auth/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import TransferPage from "../pages/accounts/TransferPage";
import AccountsPage from "../pages/accounts/AccountsPage";
import AccountHistoryPage from "../pages/accounts/AccountHistoryPage";
import IncomePage from "../pages/income/IncomePage";
import ExpensesPage from "../pages/expenses/ExpensesPage";
import CashPage from "../pages/cash/CashPage";
import CashExpensesPage from "../pages/cash/CashExpensesPage";
import DebtsPage from "../pages/debts/DebtsPage";
import ProfilePage from "../pages/profile/ProfilePage";
import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";
import AuthLayout from "../components/layout/AuthLayout";
import CategoriesPage from "../pages/categories/CategoriesPage";
import SavingsPage from "../pages/savings/SavingsPage";
import ReportsPage from "../pages/reports/ReportsPage";
import AdminLoginPage from "../pages/admin/AdminLoginPage";
import AdminHomePage from "../pages/admin/AdminHomePage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminAuditLogPage from "../pages/admin/AdminAuditLogPage";
import AdminProtectedRoute from "./AdminProtectedRoute";
import AdminLayout from "../components/layout/AdminLayout";
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/register" replace />} />

      <Route element={<AuthLayout />}>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
      </Route>

      {/* Admin — separate token + guard from the regular user area */}
      <Route path="/admin" element={<AdminProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminHomePage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="logs" element={<AdminAuditLogPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/accounts/:accountId/transactions" element={<AccountHistoryPage />} />
          <Route path="/accounts/transfer" element={<TransferPage />} />
          <Route path="/income" element={<IncomePage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/cash" element={<CashPage />} />
          <Route path="/cash/expenses" element={<CashExpensesPage />} />
          <Route path="/debts" element={<DebtsPage />} />
          <Route path="/savings" element={<SavingsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/register" replace />} />
    </Routes>
  );
}

export default AppRoutes;
