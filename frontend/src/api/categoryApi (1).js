import { apiFetch } from "./client";
const BASE = "/api/categories";

export async function listCategories() {
  const res = await apiFetch(BASE);
  return res.data;
}

export async function createCategory({ name, color }) {
  const res = await apiFetch(BASE, {
    method: "POST",
    body: JSON.stringify({ name, color }),
  });
  return res.data;
}

export async function updateCategory(id, { name, color }) {
  const res = await apiFetch(`${BASE}/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name, color }),
  });
  return res.data;
}

export async function deleteCategory(id) {
  await apiFetch(`${BASE}/${id}`, { method: "DELETE" });
}
