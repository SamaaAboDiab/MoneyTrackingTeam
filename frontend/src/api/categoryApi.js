import axiosClient from "./axiosClient";

const BASE = "/expense-categories";

export async function listCategories() {
  const res = await axiosClient.get(BASE);
  return res.data.data;
}

export async function createCategory({ name, color }) {
  const res = await axiosClient.post(BASE, { name, color });
  return res.data.data;
}

export async function updateCategory(id, { name, color }) {
  const res = await axiosClient.put(`${BASE}/${id}`, { name, color });
  return res.data.data;
}

export async function deleteCategory(id) {
  await axiosClient.delete(`${BASE}/${id}`);
}