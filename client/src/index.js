import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { Provider as ReduxProvider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer } from "react-toastify";

import "./index.css";
import "react-toastify/dist/ReactToastify.css";

import App from "./App";
import store from "state/store";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Suspense>
      <ReduxProvider store={store}>
        <GoogleOAuthProvider clientId="481898432716-im304rnmqv2128h01lt3tujcke23uve0.apps.googleusercontent.com">
          <App />
        </GoogleOAuthProvider>
        <ToastContainer />
      </ReduxProvider>
    </Suspense>
  </React.StrictMode>
);
