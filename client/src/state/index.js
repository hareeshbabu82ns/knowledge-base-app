import { createSlice } from '@reduxjs/toolkit';
import { loadUserLocal } from 'scenes/user/utils';

const { user, token } = loadUserLocal();

const initialState = {
  // userId: '63701cc1f03239b7f700000e',
  userId: user?._id,
  user,
  token,
  header: null,
  subHeader: null,
  encKey: '',
};

export const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    setUser: (state, { payload }) => {
      state.user = payload?.user;
      state.userId = payload?.user?._id || '';
      state.token = payload?.token || '';
    },
    setHeader: (state, { payload }) => {
      state.header = payload?.header;
      state.subHeader = payload?.subHeader;
    },
    setEncryption: (state, { payload }) => {
      state.encKey = payload;
    },
  },
});

export const { setUser, setHeader, setEncryption } = globalSlice.actions;

export const headerSelector = (state) => state.global.header;
export const subHeaderSelector = (state) => state.global.subHeader;
export const encryptionKeySelector = (state) => state.global.encKey;

export default globalSlice.reducer;
