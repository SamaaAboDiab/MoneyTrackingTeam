import axiosClient from "./axiosClient";

export const createAccount = ({ name, type, balance, currency, color }) =>
  axiosClient.post("/accounts", {
    name,
    type,
    balance,
    currency,
    color,
  });
