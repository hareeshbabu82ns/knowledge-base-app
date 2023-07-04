import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import Loadable from 'layouts/full/shared/loadable/Loadable';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('layouts/blank/BlankLayout')));

/* ****Pages***** */
const Dashboard = Loadable(lazy(() => import('scenes/dashboard')));
// const Dashboard = Loadable(lazy(() => import('views/dashboard/Dashboard')));
const SamplePage = Loadable(lazy(() => import('views/sample-page/SamplePage')));
const Icons = Loadable(lazy(() => import('views/icons/Icons')));
const TypographyPage = Loadable(lazy(() => import('views/utilities/TypographyPage')));
const Shadow = Loadable(lazy(() => import('views/utilities/Shadow')));
const Error = Loadable(lazy(() => import('views/authentication/Error')));
const Register = Loadable(lazy(() => import('views/authentication/Register')));
const Login = Loadable(lazy(() => import('views/authentication/Login')));

/*
import Dashboard from "scenes/dashboard";
import ProtectedLayout from "scenes/layout";
import Products from "scenes/products";
import Customers from "scenes/customers";
import Transactions from "scenes/transactions";
import Geography from "scenes/geography";
// import Overview from "scenes/overview";
import ExpenseStats from "scenes/dashboard/ExpenseStats";
import Daily from "scenes/daily";
import Monthly from "scenes/monthly";
import Breakdown from "scenes/breakdown";
import Admin from "scenes/admin";
import Performance from "scenes/performance";
import Login from "scenes/user/Login";
import Signup from "scenes/user/Signup";
import Expenses from "scenes/expenses";
import ThemePage from "themes/ThemePage";
import AccountsPage from "scenes/accounts";

<Routes>
  <Route element={<ProtectedLayout />}>
    <Route
      path="/"
      element={<Navigate to="/dashboard" replace />}
    />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/expenses" element={<Expenses />} />
    <Route path="/accounts" element={<AccountsPage />} />
    <Route path="/products" element={<Products />} />
    <Route path="/customers" element={<Customers />} />
    <Route path="/transactions" element={<Transactions />} />
    <Route path="/geography" element={<Geography />} />
    <Route path="/overview" element={<ExpenseStats />} />
    
    <Route path="/daily" element={<Daily />} />
    <Route path="/monthly" element={<Monthly />} />
    <Route path="/breakdown" element={<Breakdown />} />
    <Route path="/theme" element={<ThemePage />} />
    <Route path="/admin" element={<Admin />} />
    <Route path="/performance" element={<Performance />} />
  </Route>
  <Route path="/signin" element={<Login />} />
  <Route path="/signup" element={<Signup />} />
</Routes>
*/

const Router = [
  {
    path: '/',
    element: <FullLayout />,
    children: [
      { path: '/', element: <Navigate to="/dashboard" /> },
      { path: '/dashboard', exact: true, element: <Dashboard /> },
      { path: '/sample-page', exact: true, element: <SamplePage /> },
      { path: '/icons', exact: true, element: <Icons /> },
      { path: '/ui/typography', exact: true, element: <TypographyPage /> },
      { path: '/ui/shadow', exact: true, element: <Shadow /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
  {
    path: '/auth',
    element: <BlankLayout />,
    children: [
      { path: '404', element: <Error /> },
      { path: '/auth/register', element: <Register /> },
      { path: '/auth/login', element: <Login /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
];

export default Router;
