import axiosClient from "./axiosClient";

const BASE = "/expense-categories";

export const listCategories = () => axiosClient.get(BASE);

export const createCategory = ({ name, color }) =>
  axiosClient.post(BASE, { name, color });

export const updateCategory = (id, { name, color }) =>
  axiosClient.put(`${BASE}/${id}`, { name, color });

export const deleteCategory = (id) => axiosClient.delete(`${BASE}/${id}`);
