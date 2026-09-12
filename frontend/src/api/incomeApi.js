import axiosClient from "./axiosClient";

export const getIncomes = () => axiosClient.get("/income");

export const createIncome = (payload) => axiosClient.post("/income", payload);

export const getIncomeSummary = ({ year, month, currency }) =>
  axiosClient.get("/income/summary", { params: { year, month, currency } });

export const updateIncome = (id, payload) =>
  axiosClient.put(`/income/${id}`, payload);


// إيقاف/استئناف الدخل المتكرر من غير حذفه
export const toggleIncomeRecurrenceApi = (id) =>
  axiosClient.patch(`/income/${id}/toggle-recurrence`);
