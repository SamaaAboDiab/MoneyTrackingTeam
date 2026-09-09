import axiosClient from "./axiosClient";

export const getIncomes = () => axiosClient.get("/income");

export const updateIncome = (id, payload) =>
  axiosClient.put(`/income/${id}`, payload);
