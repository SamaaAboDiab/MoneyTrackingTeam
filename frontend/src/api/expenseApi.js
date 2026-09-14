import axiosClient from "./axiosClient";

export const getExpenses = () => axiosClient.get("/expenses");

export const createExpense = (payload) => axiosClient.post("/expenses", payload);
