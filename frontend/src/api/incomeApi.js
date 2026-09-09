import axiosClient from "./axiosClient";

// إيقاف/استئناف الدخل المتكرر من غير حذفه
export const toggleIncomeRecurrenceApi = (id) =>
  axiosClient.patch(`/income/${id}/toggle-recurrence`);
