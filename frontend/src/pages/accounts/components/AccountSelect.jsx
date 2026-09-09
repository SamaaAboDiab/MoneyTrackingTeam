function AccountSelect({ id, name, label, placeholder, accounts, value, onChange }) {
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <select id={id} name={name} value={value} onChange={onChange}>
        <option value="">{placeholder}</option>
        {accounts.map((account) => (
          <option key={account._id} value={account._id}>
            {account.name} ({account.balance.toLocaleString()} {account.currency})
          </option>
        ))}
      </select>
    </>
  );
}

export default AccountSelect;