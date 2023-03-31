import { createSlice } from "@reduxjs/toolkit";
import { loadUserLocal } from "scenes/user/utils";

const { user, token } = loadUserLocal();

const initialState = {
  // userId: '63701cc1f03239b7f700000e',
  userId: user?._id,
  user,
  token,
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setUser: (state, { payload }) => {
      state.user = payload?.user;
      state.userId = payload?.user?._id ? payload?.user._id : "";
    },
  },
});

export const { setUser } = globalSlice.actions;

export default globalSlice.reducer;
