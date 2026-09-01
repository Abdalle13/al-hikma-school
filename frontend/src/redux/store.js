import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";

// feature slices get added here phase by phase (students, fees, attendance, ...)
const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export default store;
