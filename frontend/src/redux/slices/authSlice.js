import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { apiError } from "../../utils/api.js";

// auth state. only the token survives a reload (localStorage), the user is
// re-fetched once on app start so a refresh never shows stale data.
const initialState = {
  user: null,
  token: localStorage.getItem("token") || null,
  mustChangePassword: false,
  initialized: false, // true once the startup /me check has settled
  status: "idle", // login / change-password in-flight status
};

// runs once when the app boots. with no token this just marks us initialized.
export const bootstrapAuth = createAsyncThunk("auth/bootstrap", async (_, { getState }) => {
  const { token } = getState().auth;
  if (!token) return null;
  const { data } = await api.get("/auth/me");
  return data.user;
});

export const login = createAsyncThunk("auth/login", async ({ loginId, password }, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/login", { loginId, password });
    return data; // { token, user, mustChangePassword }
  } catch (err) {
    return rejectWithValue(apiError(err, "Invalid login or password"));
  }
});

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/change-password", { currentPassword, newPassword });
      return data; // { token, user }
    } catch (err) {
      return rejectWithValue(apiError(err, "Could not change your password"));
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // used after a password change, which also returns a fresh session
    setCredentials(state, action) {
      const { user, token } = action.payload;
      if (user) state.user = user;
      if (token) {
        state.token = token;
        localStorage.setItem("token", token);
      }
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.mustChangePassword = false;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.initialized = true;
        state.user = action.payload;
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        // the stored token is no longer valid
        state.initialized = true;
        state.user = null;
        state.token = null;
        localStorage.removeItem("token");
      })
      .addCase(login.pending, (state) => {
        state.status = "loading";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.mustChangePassword = action.payload.mustChangePassword;
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(login.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.mustChangePassword = false;
        localStorage.setItem("token", action.payload.token);
      });
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
