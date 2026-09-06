import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as accountsApi from "../../api/accountsApi";
import { createAccount } from "./createAccountSlice";

function extractError(err, fallback) {
  const data = err.response?.data;
  if (data?.code === "SUBSCRIPTION_EXPIRED") {
    return "انتهى اشتراكك. جدّد اشتراكك عشان تقدر تعدّل بياناتك.";
  }
  return data?.message || fallback;
}

export const fetchAccounts = createAsyncThunk(
  "accounts/fetchAccounts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await accountsApi.getAccounts();
      return res.data.data;
    } catch (err) {
      return rejectWithValue(extractError(err, "تعذّر تحميل الحسابات"));
    }
  }
);

export const transferFunds = createAsyncThunk(
  "accounts/transferFunds",
  async ({ fromId, toId, amount, description }, { rejectWithValue }) => {
    try {
      const res = await accountsApi.transferFunds({
        fromId,
        toId,
        amount,
        description,
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(extractError(err, "تعذّر إتمام التحويل"));
    }
  }
);

const initialState = {
  // اللي بداخلها قائمة الحسابات
  items: [],
  // الحالة الخاصة بعملية تحميل الحسابات
  status: "idle",
  error: null,
  // الحالة الخاصة بعملية التحويل 
  transferStatus: "idle",
  transferError: null,
};

const accountsSlice = createSlice({
  name: "accounts",
  initialState,
  reducers: {
    clearAccountsError(state) {
      state.error = null;
    },
    clearTransferError(state) {
      state.transferError = null;
    },
    resetTransferStatus(state) {
      state.transferStatus = "idle";
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(createAccount.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })

      .addCase(transferFunds.pending, (state) => {
        state.transferStatus = "loading";
        state.transferError = null;
      })
      .addCase(transferFunds.fulfilled, (state) => {
        state.transferStatus = "succeeded";
      })
      .addCase(transferFunds.rejected, (state, action) => {
        state.transferStatus = "failed";
        state.transferError = action.payload;
      });
  },
});

export const { clearAccountsError, clearTransferError, resetTransferStatus } =
  accountsSlice.actions;
export default accountsSlice.reducer;
