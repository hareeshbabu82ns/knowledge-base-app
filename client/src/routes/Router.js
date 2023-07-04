import React, { lazy } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Loadable from 'layouts/full/shared/loadable/Loadable';
import { ProtectedRoute } from 'components/ProtectedRoute';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('layouts/blank/BlankLayout')));

/* ****Pages***** */
const Dashboard = Loadable(lazy(() => import('scenes/dashboard')));
const Expenses = Loadable(lazy(() => import('scenes/expenses')));
const AccountsPage = Loadable(lazy(() => import('scenes/accounts')));
const ExpenseStats = Loadable(lazy(() => import('scenes/dashboard/ExpenseStats')));

const Admin = Loadable(lazy(() => import('scenes/admin')));
const ThemePage = Loadable(lazy(() => import('themes/ThemePage')));

const SamplePage = Loadable(lazy(() => import('views/sample-page/SamplePage')));
const Icons = Loadable(lazy(() => import('views/icons/Icons')));
const TypographyPage = Loadable(lazy(() => import('views/utilities/TypographyPage')));
const Shadow = Loadable(lazy(() => import('views/utilities/Shadow')));

const Error = Loadable(lazy(() => import('views/authentication/Error')));
const Register = Loadable(lazy(() => import('scenes/user/Signup')));
const Login = Loadable(lazy(() => import('scenes/user/Login')));

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
    element: (
      <ProtectedRoute>
        <FullLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/', element: <Navigate to="/dashboard" /> },
      { path: '/dashboard', exact: true, element: <Dashboard /> },
      {
        path: '/expenses',
        element: <Outlet />,
        children: [
          { path: '', element: <Navigate to="transactions" /> },
          { path: 'transactions', exact: true, element: <Expenses /> },
          { path: 'accounts', exact: true, element: <AccountsPage /> },
          { path: 'overview', exact: true, element: <ExpenseStats /> },
        ],
      },
      {
        path: '/admin',
        element: <Outlet />,
        children: [
          { path: '', element: <Navigate to="settings" /> },
          { path: 'settings', exact: true, element: <Admin /> },
          { path: 'theme', exact: true, element: <ThemePage /> },
        ],
      },
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
