import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const api = createApi( {
  baseQuery: fetchBaseQuery( {
    baseUrl: process.env.REACT_APP_BASE_URL,
    prepareHeaders: ( headers, { getState } ) => {
      const token = getState().global?.token
      if ( token ) {
        headers.set( 'Authorization', `Bearer ${token}` )
      }
      return headers
    }
  } ),
  reducerPath: 'adminApi',
  tagTypes: [
    'User', 'Signin', 'Signup', 'GoogleSignin',
    'ExpenseTransactions',
    'Products',
    'Customers', 'Transactions',
    'Geography', 'Sales',
    'Admins', 'Performance',
    'Dashboard',
  ],
  endpoints: ( build ) => ( {
    addExpenseTransaction: build.mutation( {
      query: ( { amount, tags, type, dateUTC } ) => ( {
        url: `api/expenses/transactions`,
        method: 'POST',
        body: { amount, tags, type, dateUTC },
      } ),
      invalidatesTags: [ 'ExpenseTransactions' ],
    } ),
    getExpenseTransactions: build.query( {
      query: ( { page, pageSize, sort, search } ) => ( {
        url: `api/expenses/transactions`,
        method: 'GET',
        params: { page, pageSize, sort, search },
      } ),
      providesTags: [ 'ExpenseTransactions' ],
    } ),
    getUser: build.query( {
      query: ( id ) => `api/general/user/${id}`,
      providesTags: [ 'User' ],
    } ),
    userGoogleSignin: build.mutation( {
      query: ( { accessToken, expiresIn } ) => ( {
        url: `api/user/googleSignin`,
        method: 'POST',
        body: { accessToken, expiresIn },
      } ),
      providesTags: [ 'GoogleSignin' ],
      invalidatesTags: [ 'User' ],
    } ),
    userSignin: build.mutation( {
      query: ( { email, password } ) => ( {
        url: `api/user/signin`,
        method: 'POST',
        body: { email, password },
      } ),
      providesTags: [ 'Signin' ],
      invalidatesTags: [ 'User' ],
    } ),
    userSignup: build.mutation( {
      query: ( { firstName, lastName, email, password } ) => ( {
        url: `api/user/signup`,
        method: 'POST',
        body: { firstName, lastName, email, password },
      } ),
      providesTags: [ 'Signup' ],
      invalidatesTags: [ 'User' ],
    } ),
    getProducts: build.query( {
      query: () => `api/client/products`,
      providesTags: [ 'Products' ],
    } ),
    getCustomers: build.query( {
      query: () => `api/client/customers`,
      providesTags: [ 'Customers' ],
    } ),
    getGeography: build.query( {
      query: () => `api/client/geography`,
      providesTags: [ 'Geography' ],
    } ),
    getSales: build.query( {
      query: () => `api/sales/sales`,
      providesTags: [ 'Sales' ],
    } ),
    getTransactions: build.query( {
      query: ( { page, pageSize, sort, search } ) => ( {
        url: `api/client/transactions`,
        method: 'GET',
        params: { page, pageSize, sort, search },
      } ),
      providesTags: [ 'Transactions' ],
    } ),
    getAdmins: build.query( {
      query: () => `api/management/admins`,
      providesTags: [ 'Admins' ],
    } ),
    getUserPerformance: build.query( {
      query: ( id ) => `api/management/performance/${id}`,
      providesTags: [ 'Performance' ],
    } ),
    getDashboard: build.query( {
      query: () => 'api/general/dashboard',
      providesTags: [ 'Dashboard' ],
    } ),
  } )
} )

export const {
  useGetUserQuery,
  useUserSigninMutation,
  useUserSignupMutation,
  useUserGoogleSigninMutation,
  useGetExpenseTransactionsQuery,
  useAddExpenseTransactionMutation,
  useGetProductsQuery,
  useGetCustomersQuery,
  useGetTransactionsQuery,
  useGetGeographyQuery,
  useGetSalesQuery,
  useGetAdminsQuery,
  useGetUserPerformanceQuery,
  useGetDashboardQuery,
} = api