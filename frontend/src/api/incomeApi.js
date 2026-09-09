import axiosClient from "./axiosClient";

export const getIncomes = () => axiosClient.get("/income");

export const createIncome = ({ name, category, amount, currency, receivedDate, notes }) =>
  axiosClient.post("/income", {
    name,
    category,
    amount,
    currency,
    receivedDate,
    notes: notes || undefined,
  });