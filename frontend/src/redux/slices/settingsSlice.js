import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api.js";

// the public school settings: name, tagline, contacts, socials. used by the
// header, the footer and the public pages. fetched once when the app loads.
const fallback = {
  schoolName: "Al Hikma School",
  tagline:
    "Primary and secondary education for Somali families, with attendance and results you can follow online.",
  about: "",
  address: "KM4, Mogadishu, Somalia",
  phone: "+252 61 915 7381",
  email: "info@alhikmaschool.so",
  logo: "",
  currency: "USD",
  mobileMoneyOperators: ["EVC Plus", "Zaad"],
  socials: {
    whatsapp: "https://wa.me/252619157381",
  },
};

export const fetchPublicSettings = createAsyncThunk("settings/fetchPublic", async () => {
  const { data } = await api.get("/settings");
  return data.settings;
});

const settingsSlice = createSlice({
  name: "settings",
  initialState: { data: fallback, status: "idle" },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicSettings.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPublicSettings.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = { ...fallback, ...action.payload };
      })
      .addCase(fetchPublicSettings.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export default settingsSlice.reducer;
