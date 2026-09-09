import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import {
  createIncome,
  fetchIncomes,
  resetCreateIncomeStatus,
} from "../../store/slices/incomeSlice";
import IncomeForm from "./components/IncomeForm";
import IncomeList from "./components/IncomeList";
import "./IncomePage.css";

const initialForm = {
  name: "",
  category: "",
  amount: "",
  currency: "EGP",
  receivedDate: "",
  notes: "",
};

function IncomePage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { items, status, error, createStatus, createError } = useSelector(
    (state) => state.income
  );
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    dispatch(fetchIncomes());

    return () => dispatch(resetCreateIncomeStatus());
  }, [dispatch]);

  const handleChange = ({ target }) => {
    setForm((previous) => ({ ...previous, [target.name]: target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await dispatch(
      createIncome({
        ...form,
        name: form.name.trim(),
        amount: Number(form.amount),
        notes: form.notes.trim(),
      })
    );

    if (createIncome.fulfilled.match(result)) setForm(initialForm);
  };

  return (
    <div className="income-page">
      <div className="income-container">
        <div className="income-page-header">
          <div>
            <h1>{t("income.title")}</h1>
            <p>{t("income.description")}</p>
          </div>
          <Link to="/dashboard" className="income-back-link">
            {t("common.backToDashboard")}
          </Link>
        </div>

        <IncomeForm form={form} createStatus={createStatus} createError={createError} onChange={handleChange} onSubmit={handleSubmit} t={t} />
        <IncomeList items={items} status={status} error={error} t={t} />
      </div>
    </div>
  );
}

export default IncomePage;
