import { createSlice } from "@reduxjs/toolkit";
import {
  loadThemeLocal,
  loadUserLocal,
  saveThemeLocal,
} from "scenes/user/utils";

const { user, token } = loadUserLocal();
const { mode, baseColor } = loadThemeLocal();

const initialState = {
  mode,
  baseColor,
  // userId: '63701cc1f03239b7f700000e',
  userId: user?._id,
  user,
  token,
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setBaseColor: (state, { payload }) => {
      state.baseColor = payload.baseColor;
      saveThemeLocal({ mode: state.mode, baseColor: state.baseColor });
    },
    setMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
      saveThemeLocal({ mode: state.mode, baseColor: state.baseColor });
    },
    setUser: (state, { payload }) => {
      state.user = payload?.user;
      state.userId = payload?.user?._id ? payload?.user._id : "";
    },
  },
});

export const { setMode, setUser, setBaseColor } = globalSlice.actions;

export default globalSlice.reducer;
