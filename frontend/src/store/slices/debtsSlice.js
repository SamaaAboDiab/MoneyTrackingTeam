import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as debtApi from "../../api/debtApi";
import { extractError } from "../../utils/errorHandler";

export const fetchDebts = createAsyncThunk(
  "debts/fetchDebts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await debtApi.getDebts();
      return res.data.data;
    } catch (err) {
      return rejectWithValue(extractError(err, "تعذّر تحميل الديون"));
    }
  }
);

export const createDebtEntry = createAsyncThunk(
  "debts/createDebtEntry",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await debtApi.createDebt(payload);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(extractError(err, "تعذّر إضافة الدين"));
    }
  }
);

export const addDebtPaymentEntry = createAsyncThunk(
  "debts/addDebtPaymentEntry",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await debtApi.addDebtPayment(id, payload);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(extractError(err, "تعذّر تسجيل دفعة الدين"));
    }
  }
);

export const deleteDebtEntry = createAsyncThunk(
  "debts/deleteDebtEntry",
  async (id, { rejectWithValue }) => {
    try {
      await debtApi.deleteDebt(id);
      return id;
    } catch (err) {
      return rejectWithValue(extractError(err, "تعذّر حذف الدين"));
    }
  }
);

const initialState = {
  items: [],
  status: "idle",
  error: null,
  createStatus: "idle",
  createError: null,
  paymentStatus: "idle",
  paymentError: null,
  deleteStatus: "idle",
  deleteError: null,
};

const debtsSlice = createSlice({
  name: "debts",
  initialState,
  reducers: {
    clearDebtCreateState(state) {
      state.createStatus = "idle";
      state.createError = null;
    },
    clearDebtPaymentState(state) {
      state.paymentStatus = "idle";
      state.paymentError = null;
    },
    resetDebtDeleteStatus(state) {
      state.deleteStatus = "idle";
      state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDebts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDebts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchDebts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(createDebtEntry.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(createDebtEntry.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.items = [action.payload, ...state.items];
      })
      .addCase(createDebtEntry.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError = action.payload;
      })
      .addCase(addDebtPaymentEntry.pending, (state) => {
        state.paymentStatus = "loading";
        state.paymentError = null;
      })
      .addCase(addDebtPaymentEntry.fulfilled, (state, action) => {
        state.paymentStatus = "succeeded";
        const updatedDebt = action.payload?.debt || action.payload;
        if (updatedDebt) {
          const index = state.items.findIndex((item) => item._id === updatedDebt._id);
          if (index !== -1) state.items[index] = updatedDebt;
        }
      })
      .addCase(addDebtPaymentEntry.rejected, (state, action) => {
        state.paymentStatus = "failed";
        state.paymentError = action.payload;
      })
      .addCase(deleteDebtEntry.pending, (state) => {
        state.deleteStatus = "loading";
        state.deleteError = null;
      })
      .addCase(deleteDebtEntry.fulfilled, (state, action) => {
        state.deleteStatus = "succeeded";
        state.items = state.items.filter((item) => item._id !== action.payload);
      })
      .addCase(deleteDebtEntry.rejected, (state, action) => {
        state.deleteStatus = "failed";
        state.deleteError = action.payload;
      });
  },
});

export const { clearDebtCreateState, clearDebtPaymentState, resetDebtDeleteStatus } = debtsSlice.actions;
export default debtsSlice.reducer;
