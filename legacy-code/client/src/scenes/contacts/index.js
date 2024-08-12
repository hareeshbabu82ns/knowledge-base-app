import { Box, useTheme } from '@mui/material'
import { tokens } from '../../theme'
import { DataGrid, GridToolbar } from '@mui/x-data-grid'

import { mockDataContacts } from '../../data/mockData'
import Header from '../../components/Header'

const Contacts = () => {
  const theme = useTheme()
  const colors = tokens( theme.palette.mode )

  const columns = [
    { field: 'id', headerName: 'ID', },
    {
      field: 'name', headerName: 'Name', flex: 1,
      cellClassName: 'name-column--cell',
    },
    {
      field: 'age', headerName: 'Age', type: 'number',
      headerAlign: 'left', align: 'left',
    },
    {
      field: 'phone', headerName: 'Phone', flex: 1,
    },
    {
      field: 'email', headerName: 'Email', flex: 1,
    },
    {
      field: 'address', headerName: 'Address', flex: 1,
    },
    {
      field: 'city', headerName: 'City', flex: 1,
    },
    {
      field: 'zipCode', headerName: 'Zip Code', flex: 1,
    },
  ]

  return (
    <Box m='20px'>
      <Header title='Contacts' subtitle='Connecting to Contacts' />
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
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[ 100 ]} !important`,
          },

        }}>
        <DataGrid rows={mockDataContacts} columns={columns}
          components={{ Toolbar: GridToolbar }} />
      </Box>
    </Box>
  )
}

export default Contacts