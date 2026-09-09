import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as incomeApi from "../../api/incomeApi";
import { extractError } from "../../utils/errorHandler";

export const fetchIncomes = createAsyncThunk(
  "incomes/fetchIncomes",
  async (_, { rejectWithValue }) => {
    try {
      const res = await incomeApi.getIncomes();
      return res.data.data;
    } catch (err) {
      return rejectWithValue(extractError(err, "تعذّر تحميل مصادر الدخل"));
    }
  }
);

export const updateIncomeEntry = createAsyncThunk(
  "incomes/updateIncomeEntry",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await incomeApi.updateIncome(id, payload);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(extractError(err, "تعذّر تحديث مصدر الدخل"));
    }
  }
);

const initialState = {
  items: [],
  status: "idle",
  error: null,
  updateStatus: "idle",
  updateError: null,
};

const incomeSlice = createSlice({
  name: "incomes",
  initialState,
  reducers: {
    clearIncomeError(state) {
      state.error = null;
    },
    clearIncomeUpdateError(state) {
      state.updateError = null;
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
      .addCase(updateIncomeEntry.pending, (state) => {
        state.updateStatus = "loading";
        state.updateError = null;
      })
      .addCase(updateIncomeEntry.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        const index = state.items.findIndex((item) => item._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateIncomeEntry.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.updateError = action.payload;
      });
  },
});

export const { clearIncomeError, clearIncomeUpdateError } = incomeSlice.actions;
export default incomeSlice.reducer;
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as incomeApi from "../../api/incomeApi";
import { extractError } from "../../utils/errorHandler";

export const toggleIncomeRecurrence = createAsyncThunk(
  "income/toggleRecurrence",
  async (id, { rejectWithValue }) => {
    try {
      const res = await incomeApi.toggleIncomeRecurrenceApi(id);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(extractError(err, "تعذّر تحديث حالة الدخل المتكرر"));
    }
  }
);

const initialState = {
  items: [],
};

const incomeSlice = createSlice({
  name: "income",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder.addCase(toggleIncomeRecurrence.fulfilled, (state, action) => {
      const index = state.items.findIndex((item) => item._id === action.payload._id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    });
  },
});

export default incomeSlice.reducer;
