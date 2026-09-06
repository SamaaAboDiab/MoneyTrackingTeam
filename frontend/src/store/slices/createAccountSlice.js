import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as createAccountApi from "../../api/createAccountApi";

function extractError(err, fallback) {
  const data = err.response?.data;
  if (data?.code === "SUBSCRIPTION_EXPIRED") {
    return "انتهى اشتراكك. جدّد اشتراكك عشان تقدر تعدّل بياناتك.";
  }
  return data?.message || fallback;
}

export const createAccount = createAsyncThunk(
  "createAccount/createAccount",
  async (account, { rejectWithValue }) => {
    try {
      const res = await createAccountApi.createAccount(account);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(extractError(err, "تعذّر إضافة الحساب"));
    }
  }
);

const initialState = {
  status: "idle",
  error: null,
  item: null,
};

const createAccountSlice = createSlice({
  name: "createAccount",
  initialState,
  reducers: {
    clearCreateAccountError(state) {
      state.error = null;
    },
    resetCreateAccountStatus(state) {
      state.status = "idle";
      state.item = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAccount.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.item = null;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.item = action.payload;
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearCreateAccountError, resetCreateAccountStatus } =
  createAccountSlice.actions;
export default createAccountSlice.reducer;
