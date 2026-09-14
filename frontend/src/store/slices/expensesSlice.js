import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as expenseApi from "../../api/expenseApi";
import { extractError } from "../../utils/errorHandler";

export const fetchExpenses = createAsyncThunk(
  "expenses/fetchExpenses",
  async (_, { rejectWithValue }) => {
    try {
      const res = await expenseApi.getExpenses();
      return res.data.data;
    } catch (err) {
      return rejectWithValue(extractError(err, "تعذّر تحميل المصروفات"));
    }
  }
);

export const createExpenseEntry = createAsyncThunk(
  "expenses/createExpenseEntry",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await expenseApi.createExpense(payload);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(extractError(err, "تعذّر إضافة المصروف"));
    }
  }
);

const initialState = {
  items: [],
  status: "idle",
  error: null,
  createStatus: "idle",
  createError: null,
};

const expensesSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    clearExpenseError(state) {
      state.error = null;
    },
    clearExpenseCreateError(state) {
      state.createError = null;
    },
    resetExpenseCreateStatus(state) {
      state.createStatus = "idle";
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(createExpenseEntry.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(createExpenseEntry.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.items.unshift(action.payload);
      })
      .addCase(createExpenseEntry.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError = action.payload;
      });
  },
});

export const {
  clearExpenseError,
  clearExpenseCreateError,
  resetExpenseCreateStatus,
} = expensesSlice.actions;

export default expensesSlice.reducer;
