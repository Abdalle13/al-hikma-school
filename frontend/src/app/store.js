import { configureStore } from "@reduxjs/toolkit";

// feature slices get added here phase by phase (auth, students, fees, ...)
export const store = configureStore({
  reducer: {},
});

export default store;
