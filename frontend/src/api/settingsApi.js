import axiosClient from "./axiosClient";

export const getProfile = () => axiosClient.get("/settings/profile");

export const updateProfile = ({ name, phone }) =>
  axiosClient.put("/settings/profile", { name, phone });

export const uploadPhoto = (avatar) => axiosClient.post("/settings/photo", { avatar });

export const deletePhoto = () => axiosClient.delete("/settings/photo");
