import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { TOKEN_KEY } from "../../api/axiosClient";
import * as authApi from "../../api/authApi";
import * as settingsApi from "../../api/settingsApi";
import i18n from "../../i18n/i18n";

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const res = await authApi.register({ name, email, password });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "حدث خطأ أثناء إنشاء الحساب"
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password, rememberMe }, { rejectWithValue }) => {
    try {
      const res = await authApi.login({ email, password, rememberMe });
      return res.data.data;
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message;
      if (status === 403 && message === "ACCOUNT_SUSPENDED") {
        return rejectWithValue(i18n.t("auth.login.accountSuspended"));
      }
      if (status === 401) return rejectWithValue(i18n.t("auth.login.invalidCredentials"));
      if (status === 429) return rejectWithValue(i18n.t("auth.login.tooManyAttempts"));
      return rejectWithValue(i18n.t("auth.login.genericError"));
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email }, { rejectWithValue }) => {
    try {
      const res = await authApi.forgotPassword({ email });
      return res.data.message;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "حدث خطأ أثناء إرسال رابط الاستعادة"
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const res = await authApi.resetPassword({ token, password });
      return res.data.message;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "الرابط غير صالح أو منتهي الصلاحية"
      );
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await authApi.fetchMe();
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Unauthorized");
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async ({ name, phone }, { rejectWithValue }) => {
    try {
      const res = await settingsApi.updateProfile({ name, phone });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "تعذّر تحديث البيانات");
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  "auth/uploadAvatar",
  async (avatar, { rejectWithValue }) => {
    try {
      const res = await settingsApi.uploadPhoto(avatar);
      return res.data.data.avatar;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "تعذّر رفع الصورة");
    }
  }
);

export const deleteAvatar = createAsyncThunk(
  "auth/deleteAvatar",
  async (_, { rejectWithValue }) => {
    try {
      await settingsApi.deletePhoto();
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "تعذّر حذف الصورة");
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem(TOKEN_KEY) || null,
  status: "idle",
  error: null,
  authChecked: false,
  profileStatus: "idle",
  profileError: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
      state.authChecked = true;
      localStorage.removeItem(TOKEN_KEY);
    },
    clearAuthError(state) {
      state.error = null;
    },
    markAuthChecked(state) {
      state.authChecked = true;
    },
    clearProfileError(state) {
      state.profileError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem(TOKEN_KEY, action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(resetPassword.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.authChecked = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.authChecked = true;
        localStorage.removeItem(TOKEN_KEY);
      })
      .addCase(updateProfile.pending, (state) => {
        state.profileStatus = "loading";
        state.profileError = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profileStatus = "succeeded";
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.profileStatus = "failed";
        state.profileError = action.payload;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        if (state.user) state.user.avatar = action.payload;
      })
      .addCase(deleteAvatar.fulfilled, (state) => {
        if (state.user) state.user.avatar = "";
      });
  },
});

export const { logout, clearAuthError, markAuthChecked, clearProfileError } = authSlice.actions;
export default authSlice.reducer;
