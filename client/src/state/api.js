import { DateTime } from 'luxon';

import { createApi, fetchBaseQuery, retry } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.REACT_APP_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().global?.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithRetry = retry(baseQuery, { maxRetries: 2 });

export const api = createApi({
  baseQuery: baseQueryWithRetry,
  reducerPath: 'adminApi',
  tagTypes: [
    'User',
    'Signin',
    'Signup',
    'GoogleSignin',
    'ExpenseTransactionsUpload',
    'ExpenseTransactions',
    'ExpenseUserStats',
    'ExpenseTagStats',
    'ExpenseTypeStats',
    'Products',
    'Customers',
    'Transactions',
    'Geography',
    'Sales',
    'Admins',
    'Performance',
    'Dashboard',
    'ExpenseTags',
  ],
  endpoints: (build) => ({
    recalculateExpenseStats: build.mutation({
      query: ({ year }) => {
        return {
          url: `api/expenses/recalculateStats`,
          method: 'POST',
          params: { year },
        };
      },
      invalidatesTags: [
        'ExpenseTransactions',
        'ExpenseAccounts',
        'ExpenseUserStats',
        'ExpenseTagStats',
        'ExpenseTypeStats',
        'ExpenseTags',
      ],
    }),

    deleteExpenseAccount: build.mutation({
      query: (id) => ({
        url: `api/expenses/accounts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ExpenseAccounts'],
    }),

    updateExpenseAccount: build.mutation({
      query: ({ id, name, description, type, config }) => ({
        url: `api/expenses/accounts/${id}`,
        method: 'PATCH',
        body: { name, description, type, config },
      }),
      invalidatesTags: ['ExpenseAccounts'],
    }),

    addExpenseAccount: build.mutation({
      query: ({ id, name, description, type, config }) => {
        return {
          url: `api/expenses/accounts`,
          method: 'POST',
          body: { name, description, type, config },
        };
      },
      invalidatesTags: ['ExpenseAccounts'],
    }),

    getTags: build.query({
      query: ({ search }) => ({
        url: `api/expenses/tags`,
        method: 'GET',
        params: { search },
      }),
      providesTags: ['ExpenseTags'],
    }),

    getExpenseAccounts: build.query({
      query: ({ page, pageSize, sort, search }) => ({
        url: `api/expenses/accounts`,
        method: 'GET',
        params: { page, pageSize, sort, search },
      }),
      providesTags: ['ExpenseAccounts'],
    }),

    deleteExpenseTransaction: build.mutation({
      query: (id) => ({
        url: `api/expenses/transactions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        'ExpenseTransactions',
        'ExpenseTypeStats',
        'ExpenseTagStats',
        'ExpenseUserStats',
      ],
    }),
    updateExpenseTransaction: build.mutation({
      query: ({ id, amount, account, description, tags, type, date, timeZone }) => ({
        url: `api/expenses/transactions/${id}`,
        method: 'PATCH',
        body: { amount, account, description, tags, type, date, timeZone },
      }),
      invalidatesTags: [
        'ExpenseTransactions',
        'ExpenseTypeStats',
        'ExpenseTagStats',
        'ExpenseUserStats',
        'ExpenseTags',
      ],
    }),
    fileUpload: build.mutation({
      query: (data) => ({
        url: `api/expenses/upload`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        'ExpenseTransactions',
        'ExpenseTypeStats',
        'ExpenseTagStats',
        'ExpenseUserStats',
      ],
    }),
    uploadTransactions: build.mutation({
      query: ({ file, bankConfig, bankAccount }) => ({
        url: `api/expenses/uploadTransactions`,
        method: 'POST',
        body: { file, bankConfig, bankAccount },
      }),
      invalidatesTags: [
        'ExpenseTransactions',
        'ExpenseTypeStats',
        'ExpenseTagStats',
        'ExpenseUserStats',
        'ExpenseTags',
      ],
    }),
    uploadAccounts: build.mutation({
      query: ({ file }) => ({
        url: `api/expenses/uploadAccounts`,
        method: 'POST',
        body: { file },
      }),
      invalidatesTags: [
        'ExpenseAccounts',
        'ExpenseTransactions',
        'ExpenseTypeStats',
        'ExpenseTagStats',
        'ExpenseUserStats',
      ],
    }),
    addExpenseTransaction: build.mutation({
      query: ({ amount, account, description, tags, type, date, timeZone }) => {
        const localTimeZone = timeZone || DateTime.now().zoneName;
        return {
          url: `api/expenses/transactions`,
          method: 'POST',
          body: {
            amount,
            account,
            description,
            tags,
            type,
            date,
            timeZone: localTimeZone,
          },
        };
      },
      invalidatesTags: [
        'ExpenseTransactions',
        'ExpenseTypeStats',
        'ExpenseTagStats',
        'ExpenseUserStats',
      ],
    }),
    getExpenseTransactions: build.query({
      query: ({ page, pageSize, sort, search }) => ({
        url: `api/expenses/transactions`,
        method: 'GET',
        params: { page, pageSize, sort, search },
      }),
      providesTags: ['ExpenseTransactions'],
    }),
    getExpenseUserStats: build.query({
      query: ({ depth, dateFrom, dateTo }) => ({
        url: `api/expenses/userStats`,
        method: 'GET',
        params: { depth, dateFrom, dateTo, fillTimeline: 'X' },
      }),
      providesTags: ['ExpenseUserStats'],
    }),
    getExpenseTagStats: build.query({
      query: ({ depth, dateFrom, tags, dateTo }) => ({
        url: `api/expenses/tagStats`,
        method: 'GET',
        params: { depth, dateFrom, dateTo, tags, fillTimeline: 'X' },
      }),
      providesTags: ['ExpenseTagStats'],
    }),
    getExpenseTypeStats: build.query({
      query: ({ depth, type, dateFrom, dateTo }) => ({
        url: `api/expenses/typeStats`,
        method: 'GET',
        params: { depth, type, dateFrom, dateTo, fillTimeline: 'X' },
      }),
      providesTags: ['ExpenseTypeStats'],
    }),
    getUser: build.query({
      query: (id) => `api/general/user/${id}`,
      providesTags: ['User'],
    }),
    userGoogleSignin: build.mutation({
      query: ({ accessToken, expiresIn }) => ({
        url: `api/user/googleSignin`,
        method: 'POST',
        body: { accessToken, expiresIn },
      }),
      providesTags: ['GoogleSignin'],
      invalidatesTags: ['User'],
    }),
    userSignin: build.mutation({
      query: ({ email, password }) => ({
        url: `api/user/signin`,
        method: 'POST',
        body: { email, password },
      }),
      providesTags: ['Signin'],
      invalidatesTags: ['User'],
    }),
    userSignup: build.mutation({
      query: ({ firstName, lastName, email, password }) => ({
        url: `api/user/signup`,
        method: 'POST',
        body: { firstName, lastName, email, password },
      }),
      providesTags: ['Signup'],
      invalidatesTags: ['User'],
    }),
    getProducts: build.query({
      query: () => `api/client/products`,
      providesTags: ['Products'],
    }),
    getCustomers: build.query({
      query: () => `api/client/customers`,
      providesTags: ['Customers'],
    }),
    getGeography: build.query({
      query: () => `api/client/geography`,
      providesTags: ['Geography'],
    }),
    getSales: build.query({
      query: () => `api/sales/sales`,
      providesTags: ['Sales'],
    }),
    getTransactions: build.query({
      query: ({ page, pageSize, sort, search }) => ({
        url: `api/client/transactions`,
        method: 'GET',
        params: { page, pageSize, sort, search },
      }),
      providesTags: ['Transactions'],
    }),
    getAdmins: build.query({
      query: () => `api/management/admins`,
      providesTags: ['Admins'],
    }),
    getUserPerformance: build.query({
      query: (id) => `api/management/performance/${id}`,
      providesTags: ['Performance'],
    }),
    getDashboard: build.query({
      query: () => 'api/general/dashboard',
      providesTags: ['Dashboard'],
    }),
  }),
});

export const {
  useGetTagsQuery,
  useGetUserQuery,
  useUserSigninMutation,
  useUserSignupMutation,
  useUserGoogleSigninMutation,
  useFileUploadMutation,
  useUploadTransactionsMutation,
  useUploadAccountsMutation,
  useRecalculateExpenseStatsMutation,
  useGetExpenseAccountsQuery,
  useAddExpenseAccountMutation,
  useUpdateExpenseAccountMutation,
  useDeleteExpenseAccountMutation,
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
