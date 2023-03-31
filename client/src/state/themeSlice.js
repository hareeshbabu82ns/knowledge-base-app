import { createSlice } from "@reduxjs/toolkit";
import { loadThemeLocal, saveThemeLocal } from "scenes/user/utils";

const { mode, baseColor, secondaryColor, tertiaryColor } = loadThemeLocal();

const initialState = {
  mode,
  baseColor,
  secondaryColor,
  tertiaryColor,
};

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setThemeColors: (state, { payload }) => {
      state.baseColor = payload.baseColor;
      state.secondaryColor = payload.secondaryColor;
      state.tertiaryColor = payload.tertiaryColor;
      saveThemeLocal({
        ...state,
        baseColor: state.baseColor,
        secondaryColor: state.secondaryColor,
        tertiaryColor: state.tertiaryColor,
      });
    },
    setBaseColor: (state, { payload }) => {
      state.baseColor = payload.baseColor;
      saveThemeLocal({ ...state, baseColor: state.baseColor });
    },
    setSecondaryColor: (state, { payload }) => {
      state.secondaryColor = payload.secondaryColor;
      saveThemeLocal({ ...state, secondaryColor: state.secondaryColor });
    },
    setTertiaryColor: (state, { payload }) => {
      state.tertiaryColor = payload.tertiaryColor;
      saveThemeLocal({ ...state, tertiaryColor: state.tertiaryColor });
    },
    setMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
      saveThemeLocal({ ...state, mode: state.mode });
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setMode,
  setBaseColor,
  setSecondaryColor,
  setTertiaryColor,
  setThemeColors,
} = themeSlice.actions;

export default themeSlice.reducer;
