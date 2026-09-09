import { useTranslation } from "react-i18next";

function IncomeItem({ income }) {
  const { t, i18n } = useTranslation();
  const date = new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" }).format(
    new Date(income.receivedDate)
  );
  const amount = Number(income.amount).toLocaleString(i18n.language, {
    maximumFractionDigits: 2,
  });

  return (
    <article className="income-item">
      <div>
        <h3>{income.name}</h3>
        <p>{t(`income.categories.${income.category}`)} · {date}</p>
        {income.notes && <small>{income.notes}</small>}
      </div>
      <strong>{amount} {income.currency}</strong>
    </article>
  );
}

export default IncomeItem;