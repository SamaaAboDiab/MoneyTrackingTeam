import axiosClient from "./axiosClient";

export function register({ name, email, password }) {
  return axiosClient.post("/auth/register", { name, email, password });
}

export function login({ email, password, rememberMe }) {
  return axiosClient.post("/auth/login", { email, password, rememberMe });
}

export function fetchMe() {
  return axiosClient.get("/auth/me");
}

export function forgotPassword({ email }) {
  return axiosClient.post("/auth/forgot-password", { email });
}

export function resetPassword({ token, password }) {
  return axiosClient.post("/auth/reset-password", { token, password });
}
