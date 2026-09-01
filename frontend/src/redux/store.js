import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import settingsReducer from "./slices/settingsSlice.js";

// feature slices get added here phase by phase (students, fees, attendance, ...)
const store = configureStore({
  reducer: {
    auth: authReducer,
    settings: settingsReducer,
  },
});

export default store;
