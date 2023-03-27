import { DateTime } from "luxon";

import { createApi, fetchBaseQuery, retry } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.REACT_APP_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().global?.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithRetry = retry(baseQuery, { maxRetries: 2 });

export const api = createApi({
  baseQuery: baseQueryWithRetry,
  reducerPath: "adminApi",
  tagTypes: [
    "User",
    "Signin",
    "Signup",
    "GoogleSignin",
    "ExpenseTransactions",
    "ExpenseUserStats",
    "ExpenseTagStats",
    "ExpenseTypeStats",
    "Products",
    "Customers",
    "Transactions",
    "Geography",
    "Sales",
    "Admins",
    "Performance",
    "Dashboard",
  ],
  endpoints: (build) => ({
    deleteExpenseTransaction: build.mutation({
      query: (id) => ({
        url: `api/expenses/transactions/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        "ExpenseTransactions",
        "ExpenseTypeStats",
        "ExpenseTagStats",
        "ExpenseUserStats",
      ],
    }),
    updateExpenseTransaction: build.mutation({
      query: ({ id, amount, tags, type, date, timeZone }) => ({
        url: `api/expenses/transactions/${id}`,
        method: "PATCH",
        body: { amount, tags, type, date, timeZone },
      }),
      invalidatesTags: [
        "ExpenseTransactions",
        "ExpenseTypeStats",
        "ExpenseTagStats",
        "ExpenseUserStats",
      ],
    }),
    addExpenseTransaction: build.mutation({
      query: ({ amount, tags, type, date, timeZone }) => {
        const localTimeZone = timeZone || DateTime.now().zoneName;
        return {
          url: `api/expenses/transactions`,
          method: "POST",
          body: { amount, tags, type, date, timeZone: localTimeZone },
        };
      },
      invalidatesTags: [
        "ExpenseTransactions",
        "ExpenseTypeStats",
        "ExpenseTagStats",
        "ExpenseUserStats",
      ],
    }),
    getExpenseTransactions: build.query({
      query: ({ page, pageSize, sort, search }) => ({
        url: `api/expenses/transactions`,
        method: "GET",
        params: { page, pageSize, sort, search },
      }),
      providesTags: ["ExpenseTransactions"],
    }),
    getExpenseUserStats: build.query({
      query: ({ depth, dateFrom, dateTo }) => ({
        url: `api/expenses/userStats`,
        method: "GET",
        params: { depth, dateFrom, dateTo },
      }),
      providesTags: ["ExpenseUserStats"],
    }),
    getExpenseTagStats: build.query({
      query: ({ depth, tag, dateFrom, dateTo }) => ({
        url: `api/expenses/tagStats`,
        method: "GET",
        params: { depth, tag, dateFrom, dateTo },
      }),
      providesTags: ["ExpenseTagStats"],
    }),
    getExpenseTypeStats: build.query({
      query: ({ depth, type, dateFrom, dateTo }) => ({
        url: `api/expenses/typeStats`,
        method: "GET",
        params: { depth, type, dateFrom, dateTo },
      }),
      providesTags: ["ExpenseTypeStats"],
    }),
    getUser: build.query({
      query: (id) => `api/general/user/${id}`,
      providesTags: ["User"],
    }),
    userGoogleSignin: build.mutation({
      query: ({ accessToken, expiresIn }) => ({
        url: `api/user/googleSignin`,
        method: "POST",
        body: { accessToken, expiresIn },
      }),
      providesTags: ["GoogleSignin"],
      invalidatesTags: ["User"],
    }),
    userSignin: build.mutation({
      query: ({ email, password }) => ({
        url: `api/user/signin`,
        method: "POST",
        body: { email, password },
      }),
      providesTags: ["Signin"],
      invalidatesTags: ["User"],
    }),
    userSignup: build.mutation({
      query: ({ firstName, lastName, email, password }) => ({
        url: `api/user/signup`,
        method: "POST",
        body: { firstName, lastName, email, password },
      }),
      providesTags: ["Signup"],
      invalidatesTags: ["User"],
    }),
    getProducts: build.query({
      query: () => `api/client/products`,
      providesTags: ["Products"],
    }),
    getCustomers: build.query({
      query: () => `api/client/customers`,
      providesTags: ["Customers"],
    }),
    getGeography: build.query({
      query: () => `api/client/geography`,
      providesTags: ["Geography"],
    }),
    getSales: build.query({
      query: () => `api/sales/sales`,
      providesTags: ["Sales"],
    }),
    getTransactions: build.query({
      query: ({ page, pageSize, sort, search }) => ({
        url: `api/client/transactions`,
        method: "GET",
        params: { page, pageSize, sort, search },
      }),
      providesTags: ["Transactions"],
    }),
    getAdmins: build.query({
      query: () => `api/management/admins`,
      providesTags: ["Admins"],
    }),
    getUserPerformance: build.query({
      query: (id) => `api/management/performance/${id}`,
      providesTags: ["Performance"],
    }),
    getDashboard: build.query({
      query: () => "api/general/dashboard",
      providesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetUserQuery,
  useUserSigninMutation,
  useUserSignupMutation,
  useUserGoogleSigninMutation,
  useGetExpenseTransactionsQuery,
  useAddExpenseTransactionMutation,
  useUpdateExpenseTransactionMutation,
  useDeleteExpenseTransactionMutation,
  useGetExpenseUserStatsQuery,
  useGetExpenseTagStatsQuery,
  useGetExpenseTypeStatsQuery,
  useGetProductsQuery,
  useGetCustomersQuery,
  useGetTransactionsQuery,
  useGetGeographyQuery,
  useGetSalesQuery,
  useGetAdminsQuery,
  useGetUserPerformanceQuery,
  useGetDashboardQuery,
} = api;
