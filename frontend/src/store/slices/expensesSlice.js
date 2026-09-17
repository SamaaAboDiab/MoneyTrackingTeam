import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as expenseApi from "../../api/expenseApi";
import * as expenseCategoryApi from "../../api/expenseCategoryApi";
import { extractError } from "../../api/error";

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

export const fetchCategories = createAsyncThunk(
  "expenses/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const res = await expenseCategoryApi.listCategories();
      return res.data.data;
    } catch (err) {
      return rejectWithValue(extractError(err, "تعذّر تحميل التصنيفات"));
    }
  }
);

export const createCategoryEntry = createAsyncThunk(
  "expenses/createCategoryEntry",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await expenseCategoryApi.createCategory(payload);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(extractError(err, "تعذّر إضافة التصنيف"));
    }
  }
);

export const updateCategoryEntry = createAsyncThunk(
  "expenses/updateCategoryEntry",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const res = await expenseCategoryApi.updateCategory(id, payload);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(extractError(err, "تعذّر تعديل التصنيف"));
    }
  }
);

export const deleteCategoryEntry = createAsyncThunk(
  "expenses/deleteCategoryEntry",
  async (id, { rejectWithValue }) => {
    try {
      await expenseCategoryApi.deleteCategory(id);
      return id;
    } catch (err) {
      return rejectWithValue(extractError(err, "تعذّر حذف التصنيف"));
    }
  }
);

const initialState = {
  items: [],
  status: "idle",
  error: null,
  createStatus: "idle",
  createError: null,
  categories: {
    items: [],
    status: "idle",
    error: null,
    createStatus: "idle",
    createError: null,
    updateStatus: "idle",
    updateError: null,
    deleteStatus: "idle",
    deleteError: null,
  },
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
    clearCategoryError(state) {
      state.categories.error = null;
    },
    clearCategoryCreateError(state) {
      state.categories.createError = null;
    },
    clearCategoryUpdateError(state) {
      state.categories.updateError = null;
    },
    clearCategoryDeleteError(state) {
      state.categories.deleteError = null;
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
      })

      .addCase(fetchCategories.pending, (state) => {
        state.categories.status = "loading";
        state.categories.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories.status = "succeeded";
        state.categories.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categories.status = "failed";
        state.categories.error = action.payload;
      })

      .addCase(createCategoryEntry.pending, (state) => {
        state.categories.createStatus = "loading";
        state.categories.createError = null;
      })
      .addCase(createCategoryEntry.fulfilled, (state, action) => {
        state.categories.createStatus = "succeeded";
        state.categories.items.push(action.payload);
      })
      .addCase(createCategoryEntry.rejected, (state, action) => {
        state.categories.createStatus = "failed";
        state.categories.createError = action.payload;
      })

      .addCase(updateCategoryEntry.pending, (state) => {
        state.categories.updateStatus = "loading";
        state.categories.updateError = null;
      })
      .addCase(updateCategoryEntry.fulfilled, (state, action) => {
        state.categories.updateStatus = "succeeded";
        const index = state.categories.items.findIndex(
          (cat) => cat._id === action.payload._id
        );
        if (index !== -1) {
          state.categories.items[index] = action.payload;
        }
      })
      .addCase(updateCategoryEntry.rejected, (state, action) => {
        state.categories.updateStatus = "failed";
        state.categories.updateError = action.payload;
      })

      .addCase(deleteCategoryEntry.pending, (state) => {
        state.categories.deleteStatus = "loading";
        state.categories.deleteError = null;
      })
      .addCase(deleteCategoryEntry.fulfilled, (state, action) => {
        state.categories.deleteStatus = "succeeded";
        state.categories.items = state.categories.items.filter(
          (cat) => cat._id !== action.payload
        );
      })
      .addCase(deleteCategoryEntry.rejected, (state, action) => {
        state.categories.deleteStatus = "failed";
        state.categories.deleteError = action.payload;
      });
  },
});

export const {
  clearExpenseError,
  clearExpenseCreateError,
  resetExpenseCreateStatus,
  clearCategoryError,
  clearCategoryCreateError,
  clearCategoryUpdateError,
  clearCategoryDeleteError,
} = expensesSlice.actions;

export default expensesSlice.reducer;
