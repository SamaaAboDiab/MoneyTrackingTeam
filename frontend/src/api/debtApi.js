import axiosClient from "./axiosClient";

export const getDebts = () => axiosClient.get("/debts");

export const createDebt = (payload) => axiosClient.post("/debts", payload);

export const addDebtPayment = (id, payload) => axiosClient.post(`/debts/${id}/payments`, payload);

export const updateDebt = (id, payload) => axiosClient.put(`/debts/${id}`, payload);

export const deleteDebt = (id) => axiosClient.delete(`/debts/${id}`);
