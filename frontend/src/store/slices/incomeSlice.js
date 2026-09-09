import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as incomeApi from "../../api/incomeApi";
import { extractError } from "../../utils/errorHandler";

export const fetchIncomes = createAsyncThunk(
  "income/fetchIncomes",
  async (_, { rejectWithValue }) => {
    try {
      const response = await incomeApi.getIncomes();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(extractError(error, "تعذّر تحميل مصادر الدخل"));
    }
  }
);

export const createIncome = createAsyncThunk(
  "income/createIncome",
  async (income, { rejectWithValue }) => {
    try {
      const response = await incomeApi.createIncome(income);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(extractError(error, "تعذّرت إضافة مصدر الدخل"));
    }
  }
);

const incomeSlice = createSlice({
  name: "income",
  initialState: { items: [], status: "idle", error: null, createStatus: "idle", createError: null },
  reducers: {
    resetCreateIncomeStatus(state) {
      state.createStatus = "idle";
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIncomes.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchIncomes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchIncomes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(createIncome.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(createIncome.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.items.unshift(action.payload);
      })
      .addCase(createIncome.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError = action.payload;
      });
  },
});

export const { resetCreateIncomeStatus } = incomeSlice.actions;
export default incomeSlice.reducer;