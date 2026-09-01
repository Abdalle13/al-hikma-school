import { createSlice } from "@reduxjs/toolkit";

// minimal auth state for phase 1. login and register thunks are added in
// frontend phase f2, wired to the backend auth endpoints.
const initialState = {
  user: null,
  token: localStorage.getItem("token") || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      if (token) localStorage.setItem("token", token);
    },
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
