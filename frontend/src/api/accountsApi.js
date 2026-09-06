import axiosClient from "./axiosClient";

// هاتلي كل الحسابات الموجودة للمستخدم
// عشان يعرض الحسابات اللي المستخدم هيختار منها.
export const getAccounts = () =>
   axiosClient.get("/accounts");


// تحويل فلوس بين حسابين 
export const transferFunds = ({ fromId, toId, amount, description }) =>
    axiosClient.post("/accounts/transfer", {
      fromId,
      toId,
      amount,
      description,
  });

