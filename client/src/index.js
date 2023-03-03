import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import ErrorPage from './error-page';

import Dashboard from './scenes/dashboard'
import Invoices from './scenes/invoices'
import Contacts from './scenes/contacts'
import Bar from './scenes/bar'
import Form from './scenes/form'
import Line from './scenes/line'
import Pie from './scenes/pie'
import FAQ from './scenes/faq'
import Geography from './scenes/geography'
import Calendar from './scenes/calendar'
import Team from './scenes/team';

const router = createBrowserRouter( [
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/invoices",
        element: <Invoices />,
      },
      {
        path: "/team",
        element: <Team />,
      },
      {
        path: "/contacts",
        element: <Contacts />,
      },
      {
        path: "/contacts",
        element: <Contacts />,
      },
      {
        path: "/bar",
        element: <Bar />,
      },
      {
        path: "/profile",
        element: <Form />,
      },
      {
        path: "/line",
        element: <Line />,
      },
      {
        path: "/pie",
        element: <Pie />,
      },
      {
        path: "/bar",
        element: <Bar />,
      },
      {
        path: "/geography",
        element: <Geography />,
      },
      {
        path: "/faq",
        element: <FAQ />,
      },
      {
        path: "/calendar",
        element: <Calendar />,
      },
    ]
  },
] );

const root = ReactDOM.createRoot( document.getElementById( 'root' ) );
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

