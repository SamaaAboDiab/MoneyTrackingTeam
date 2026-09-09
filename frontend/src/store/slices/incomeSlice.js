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
