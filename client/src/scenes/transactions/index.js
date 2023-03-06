import {
  Box, useTheme
} from '@mui/material'
import React, { useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'

import { useGetTransactionsQuery } from 'state/api'
import Header from 'components/Header'
import DataGridCustomToolbar from 'components/DataGridCustomToolbar'

const columns = [
  {
    field: '_id',
    headerName: 'ID',
    flex: 1,
  },
  {
    field: 'userId',
    headerName: 'User Id',
    flex: 1,
  },
  {
    field: 'createdAt',
    headerName: 'Created At',
    flex: 1,
  },
  {
    field: 'products',
    headerName: '# of Products',
    flex: 0.5,
    sortable: false,
    renderCell: ( { value } ) => value.length
  },
  {
    field: 'cost',
    headerName: 'Cost',
    flex: 1,
    renderCell: ( { value } ) => `$ ${Number( value ).toFixed( 2 )}`
  },
]

const Transactions = () => {

  const theme = useTheme()

  const [ page, setPage ] = useState( 0 )
  const [ pageSize, setPageSize ] = useState( 25 )
  const [ sort, setSort ] = useState( {} )
  const [ search, setSearch ] = useState( '' )
  const [ searchInput, setSearchInput ] = useState( '' )

  const { data, isLoading } = useGetTransactionsQuery( { page, pageSize, sort: JSON.stringify( sort ), search } )


  return (
    <Box m='1.5rem 2.5rem'>
      <Header title='Transactions' subtitle='List of Transactions' />
      <Box mt='40px' height='75vh'
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
          slots={{ toolbar: DataGridCustomToolbar }}
          slotProps={{
            toolbar: { search, setSearch, searchInput, setSearchInput }
          }}
        />
      </Box>
    </Box>
  )
}

export default Transactions