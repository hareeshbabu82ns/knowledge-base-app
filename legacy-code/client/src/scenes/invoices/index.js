import { Box, Typography, useTheme } from '@mui/material'
import { tokens } from '../../theme'
import { DataGrid, GridToolbar } from '@mui/x-data-grid'

import { mockDataInvoices } from '../../data/mockData'
import Header from '../../components/Header'

const Invoices = () => {
  const theme = useTheme()
  const colors = tokens( theme.palette.mode )

  const columns = [
    { field: 'id', headerName: 'ID', },
    {
      field: 'name', headerName: 'Name', flex: 1,
      cellClassName: 'name-column--cell',
    },
    {
      field: 'phone', headerName: 'Phone', flex: 1,
    },
    {
      field: 'email', headerName: 'Email', flex: 1,
    },
    {
      field: 'cost', headerName: 'Cost', flex: 1,
      renderCell: ( { row: { cost } } ) =>
        ( <Typography>$ {cost}</Typography> )
      ,
    },
    {
      field: 'date', headerName: 'Date', flex: 1,
    },
  ]

  return (
    <Box m='20px'>
      <Header title='Invoices' subtitle='List of Income/Balances' />
      <Box m='40px 0 0 0' height='70vh'
        sx={{
          "& .MuiDataGrid-root": {
            border: 'none',
          },
          "& .MuiDataGrid-cell": {
            borderBottom: 'none',
          },
          "& .name-column--cell": {
            color: colors.greenAccent[ 300 ],
          },
          "& .MuiDataGrid-columnHeaders": {
            bgcolor: colors.blueAccent[ 700 ],
            borderBottom: 'none',
          },
          "& .MuiDataGrid-virtualScroller": {
            bgcolor: colors.primary[ 400 ],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: 'none',
            bgcolor: colors.blueAccent[ 700 ],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[ 200 ]} !important`,
          },

        }}>
        <DataGrid rows={mockDataInvoices} columns={columns} checkboxSelection />
      </Box>
    </Box>
  )
}

export default Invoices