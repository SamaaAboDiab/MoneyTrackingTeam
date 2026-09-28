import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import accountsReducer from "./slices/accountsSlice";
import incomeReducer from "./slices/incomeSlice";
import expensesReducer from "./slices/expensesSlice";
import debtsReducer from "./slices/debtsSlice";
import dashboardReducer from "./slices/dashboardSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    accounts: accountsReducer,
    incomes: incomeReducer,
    expenses: expensesReducer,
    debts: debtsReducer,
    dashboard: dashboardReducer,
  },
});
