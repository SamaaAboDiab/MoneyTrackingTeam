import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import AddAccountForm from "../../features/accounts/components/AddAccountForm";

function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const { data: result } = await axiosClient.get("/accounts");
        setAccounts(result.data || []);
      } catch {
        setError("تعذر تحميل الحسابات");
      }
    };

    loadAccounts();
  }, []);

  const handleAccountCreated = (account) => {
    setAccounts((currentAccounts) => [...currentAccounts, account]);
  };

  return (
    <section dir="rtl">
      <AddAccountForm
        onAccountCreated={handleAccountCreated}
        existingAccountNames={accounts.map((account) => account.name)}
      />

      <h2>حساباتي</h2>
      {error && <p className="auth-error">{error}</p>}
      {!accounts.length && !error && <p>لا توجد حسابات مضافة حتى الآن.</p>}
      {accounts.map((account) => (
        <p key={account._id}>
          {account.name}: {account.balance} {account.currency}
        </p>
      ))}
    </section>
  );
}

export default AccountsPage;
