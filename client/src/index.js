import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { configureStore } from '@reduxjs/toolkit'
import globalReducer from 'state'
import { Provider as ReduxProvider } from 'react-redux'

import { setupListeners } from '@reduxjs/toolkit/query'
import { api } from 'state/api'

import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

const store = configureStore( {
  reducer: {
    global: globalReducer,
    [ api.reducerPath ]: api.reducer,
  },
  middleware: ( getDefault ) => getDefault().concat( api.middleware )
} )
setupListeners( store.dispatch )

const root = ReactDOM.createRoot( document.getElementById( 'root' ) );
root.render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <App />
      <ToastContainer />
    </ReduxProvider>
  </React.StrictMode>
);

