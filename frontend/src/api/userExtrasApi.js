import axiosClient from "./axiosClient";

// Announcements the admin team sent me
export const fetchMyAnnouncements = () => axiosClient.get("/announcements");

// My plan and renewal request
export const fetchMyRenewal = () => axiosClient.get("/renewal");
export const requestRenewal = (payload) => axiosClient.post("/renewal", payload);
export const cancelMyRenewal = () => axiosClient.delete("/renewal");
