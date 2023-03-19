import {
  Box, Chip, Stack, useTheme
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'

import { useGetExpenseTransactionsQuery } from 'state/api'
import Header from 'components/Header'
import DataGridCustomToolbar from 'components/DataGridCustomToolbar'
import TransactionForm from './TransactionForm'
import { INTL_DATE_LONG_OPTIONS } from 'constants'
import { EXPENSE_TYPES } from 'constants'

const columns = [
  // {
  //   field: '_id',
  //   headerName: 'ID',
  //   flex: 1,
  // },
  // {
  //   field: 'userId',
  //   headerName: 'User Id',
  //   flex: 1,
  // },
  {
    field: 'type',
    headerName: 'Type',
    resizable: false,
  },
  {
    field: 'date',
    headerName: 'Transaction Date',
    flex: 1,
    renderCell: ( { value } ) => new Date( value ).toLocaleString( 'en', INTL_DATE_LONG_OPTIONS ),
  },
  {
    field: 'amount',
    headerName: 'Amount',
    flex: 1,
    renderCell: ( { value } ) => `${Number( value ).toFixed( 2 )}`,
  },
  {
    field: 'tags',
    headerName: 'Tags',
    flex: 1,
    renderCell: ( { value } ) => {
      return (
        <Stack direction="row" spacing={1}>
          {value.map( ( v, idx ) => ( <Chip key={`${v}_${idx}`} label={v} variant='outlined' /> ) )}
        </Stack>
      )
    },
  },
]

const initFormData = {
  amount: 0,
  type: EXPENSE_TYPES[ 0 ],
  tags: '',
  date: new Date(),
}
// const initFormData = {
//   amount: Math.random() * 134,
//   type: EXPENSE_TYPES[ 0 ],
//   tags: 'ui,test',
//   date: new Date(),
// }

const Transactions = () => {

  const [ selectedTransaction, setSelectedTransaction ] = React.useState( initFormData );

  return (
    <Box m='1.5rem 2.5rem'>
      <Header title={`Transactions `} subtitle='List of Trnasactions' />

      <TransactionForm key={selectedTransaction?._id} transactionData={selectedTransaction} />

      <TransactionsGrid
        selectedTransaction={selectedTransaction}
        onRowSelected={( tr ) => {
          // console.log( tr )
          setSelectedTransaction( tr || initFormData )
        }} />

    </Box>
  )
}

const TransactionsGrid = ( { onRowSelected, selectedTransaction } ) => {

  const theme = useTheme()

  const [ page, setPage ] = useState( 0 )
  const [ pageSize, setPageSize ] = useState( 25 )
  const [ sort, setSort ] = useState( {} )
  const [ search, setSearch ] = useState( '' )
  const [ searchInput, setSearchInput ] = useState( '' )

  const [ rowSelectionModel, setRowSelectionModel ] = React.useState( [] );

  const { data, isLoading } = useGetExpenseTransactionsQuery( { page, pageSize, sort: JSON.stringify( sort ), search } )

  return (
    <Box mt='40px' height='75vh' width='100%'
      sx={{
        "& .MuiDataGrid-root": {
          border: 'none',
        },
        "& .MuiDataGrid-cell": {
          borderBottom: 'none',
        },
        "& .MuiDataGrid-columnHeaders": {
          bgcolor: theme.palette.background.alt,
          color: theme.palette.secondary[ 100 ],
          borderBottom: 'none',
        },
        "& .MuiDataGrid-virtualScroller": {
          bgcolor: theme.palette.primary.light,
          "& .MuiDataGrid-row.Mui-selected": {
            bgcolor: theme.palette.secondary[ 800 ],
          },
          "& .MuiDataGrid-row.Mui-selected:hover": {
            bgcolor: theme.palette.secondary[ 700 ],
          },
        },
        "& .MuiDataGrid-footerContainer": {
          bgcolor: theme.palette.background.alt,
          color: theme.palette.secondary[ 100 ],
          borderBottom: 'none',
        },
        "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
          color: `${theme.palette.secondary[ 200 ]} !important`,
        },
      }}
    >
      <DataGrid
        loading={isLoading || !data}
        rows={data?.transactions || []}
        rowSelection={true}
        getRowId={( row ) => row._id}
        columns={columns}
        rowCount={data?.total || 0}
        pagination
        page={page}
        initialState={{
          pagination: {
            paginationModel: { pageSize, page }
          }
        }}
        paginationMode='server'
        sortingMode='server'
        onPaginationModelChange={( m ) => {
          if ( page !== m.page )
            setPage( m.page )
          if ( pageSize !== m.pageSize )
            setPageSize( m.pageSize )
        }}
        onSortModelChange={( m ) => {
          setSort( m[ 0 ] )
        }}
        onRowSelectionModelChange={( newRowSelectionModel ) => {
          // console.log( newRowSelectionModel )
          if ( newRowSelectionModel.length > 0 ) {
            if ( selectedTransaction?._id === newRowSelectionModel[ 0 ] ) {
              setRowSelectionModel( [] )
              onRowSelected( null )
              return
            }
            const trans = data.transactions.find( ( v ) => v._id === newRowSelectionModel[ 0 ] )
            // console.log( trans )
            onRowSelected( { ...trans, tags: trans.tags.join( ',' ), date: new Date( trans.date ) } )
          } else {
            onRowSelected( null )
          }
          setRowSelectionModel( newRowSelectionModel )
        }}
        rowSelectionModel={rowSelectionModel}
        slots={{ toolbar: DataGridCustomToolbar }}
        slotProps={{
          toolbar: { search, setSearch, searchInput, setSearchInput }
        }}
      />
    </Box>
  )
}

export default Transactions