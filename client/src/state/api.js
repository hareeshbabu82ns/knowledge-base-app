import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const api = createApi( {
  baseQuery: fetchBaseQuery( { baseUrl: process.env.REACT_APP_BASE_URL } ),
  reducerPath: 'adminApi',
  tagTypes: [ 'User', 'Products', 'Customers', 'Transactions', 'Geography', 'Sales' ],
  endpoints: ( build ) => ( {
    getUser: build.query( {
      query: ( id ) => `api/general/user/${id}`,
      providesTags: [ 'User' ],
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
  } )
} )

export const {
  useGetUserQuery,
  useGetProductsQuery,
  useGetCustomersQuery,
  useGetTransactionsQuery,
  useGetGeographyQuery,
  useGetSalesQuery,
} = api