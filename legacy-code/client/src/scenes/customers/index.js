import { Box, useTheme } from "@mui/material";
import React from "react";
import { DataGrid } from "@mui/x-data-grid";

import { useGetCustomersQuery } from "state/api";
import Header from "components/Header";

const columns = [
  // {
  //   field: '_id',
  //   headerName: 'ID',
  //   flex: 1,
  // },
  {
    field: "name",
    headerName: "Name",
    flex: 0.5,
  },
  {
    field: "email",
    headerName: "eMail",
    flex: 1,
  },
  {
    field: "phoneNumber",
    headerName: "Phone Number",
    flex: 0.5,
    renderCell: (params) => {
      return params.value?.replace(/^(\d{3})(\d{3})(\d{4})/, "($1) $2 $3");
    },
  },
  {
    field: "country",
    headerName: "Country",
    flex: 0.4,
  },
  {
    field: "occupation",
    headerName: "Occupation",
    flex: 1,
  },
  // {
  //   field: 'role',
  //   headerName: 'Role',
  //   flex: 0.5,
  // },
];

function Customers() {
  const { data, isLoading } = useGetCustomersQuery();
  const theme = useTheme();

  return (
    <Box m="1.5rem 2.5rem">
      <Header title="Customers" subtitle="List of Customers" />
      <Box
        mt="40px"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .MuiDataGrid-columnHeaders": {
            bgcolor: theme.palette.background.alt,
            color: theme.palette.text.secondary,
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            bgcolor: theme.palette.primary.light,
          },
          "& .MuiDataGrid-footerContainer": {
            bgcolor: theme.palette.background.alt,
            color: theme.palette.text.secondary,
            borderBottom: "none",
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${theme.palette.text.secondary} !important`,
          },
        }}
      >
        <DataGrid
          loading={isLoading || !data}
          rows={data || []}
          getRowId={(row) => row._id}
          columns={columns}
        />
      </Box>
    </Box>
  );
}

export default Customers;
