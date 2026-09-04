import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { apiError } from "../../utils/api.js";

// auth state. only the token survives a reload (localStorage), the user is
// re-fetched once on app start so a refresh never shows stale data.
const initialState = {
  user: null,
  token: localStorage.getItem("token") || null,
  initialized: false, // true once the startup /me check has settled
  status: "idle", // login in-flight status
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
    return data; // { token, user }
  } catch (err) {
    return rejectWithValue(apiError(err, "Could not log you in, please try again"));
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
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
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(login.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
