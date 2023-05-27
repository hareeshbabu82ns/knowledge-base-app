import { useState } from "react";
import { styled, Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import { useGetExpenseAccountsQuery } from "state/api";
import DataGridCustomToolbar from "components/DataGridCustomToolbar";
import {
  getBackgroundColor,
  getHoverBackgroundColor,
  getSelectedBackgroundColor,
  getSelectedHoverBackgroundColor,
} from "themes/utils";

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  "& .MuiDataGrid-root": {
    border: "none",
  },
  "& .MuiDataGrid-cell": {
    borderBottom: "none",
  },
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: getHoverBackgroundColor(
      theme.palette.primary[800],
      theme.palette.isDark
    ),
    color: theme.palette.secondary[500],
    borderBottom: "none",
    fontSize: 18,
  },
  "& .MuiDataGrid-footerContainer": {
    backgroundColor: getBackgroundColor(
      theme.palette.info.main,
      theme.palette.isDark
    ),
    borderBottom: "none",
    "& .MuiTablePagination-root": {
      color: theme.palette.secondary[300],
    },
  },
  "& .MuiDataGrid-toolbarContainer ": {
    backgroundColor: getBackgroundColor(
      theme.palette.info.main,
      theme.palette.isDark
    ),
    "& .MuiButton-text": {
      color: `${theme.palette.secondary[800]} !important`,
    },
  },
  "& .MuiDataGrid-virtualScroller": {
    backgroundColor: getBackgroundColor(
      theme.palette.primary.light,
      theme.palette.isDark
    ),
  },
  "& .status-theme--Income": {
    backgroundColor: getBackgroundColor(
      theme.palette.success.main,
      theme.palette.isDark
    ),
    "&:hover": {
      backgroundColor: getHoverBackgroundColor(
        theme.palette.success.main,
        theme.palette.isDark
      ),
    },
    "&.Mui-selected": {
      backgroundColor: getSelectedBackgroundColor(
        theme.palette.success.main,
        theme.palette.isDark
      ),
      "&:hover": {
        backgroundColor: getSelectedHoverBackgroundColor(
          theme.palette.success.main,
          theme.palette.isDark
        ),
      },
    },
  },
  "& .status-theme--Expense": {
    backgroundColor: getBackgroundColor(
      theme.palette.error.main,
      theme.palette.isDark
    ),
    "&:hover": {
      backgroundColor: getHoverBackgroundColor(
        theme.palette.error.main,
        theme.palette.isDark
      ),
    },
    "&.Mui-selected": {
      backgroundColor: getSelectedBackgroundColor(
        theme.palette.error.main,
        theme.palette.isDark
      ),
      "&:hover": {
        backgroundColor: getSelectedHoverBackgroundColor(
          theme.palette.error.main,
          theme.palette.isDark
        ),
      },
    },
  },
}));

const columns = [
  {
    field: "_id",
    headerName: "ID",
    flex: 1,
  },
  {
    field: "name",
    headerName: "Name",
    flex: 1,
  },
  {
    field: "type",
    headerName: "Type",
    flex: 1,
  },
  {
    field: "description",
    headerName: "Description",
    flex: 2,
  },
];

const AccountsGrid = ({ onRowSelected, selectedAccount }) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [sort, setSort] = useState({});
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [rowSelectionModel, setRowSelectionModel] = useState([]);

  const { data, isLoading } = useGetExpenseAccountsQuery({
    page,
    pageSize,
    sort: JSON.stringify(sort),
    search,
  });

  return (
    <Box mt="40px" height="75vh" width="100%">
      <StyledDataGrid
        loading={isLoading || !data}
        rows={data?.accounts || []}
        rowSelection={true}
        getRowId={(row) => row._id}
        columns={columns}
        rowCount={data?.total || 0}
        pagination
        page={page}
        initialState={{
          pagination: {
            paginationModel: { pageSize, page },
          },
          columns: {
            columnVisibilityModel: {
              _id: false,
            },
          },
        }}
        paginationMode="server"
        sortingMode="server"
        onPaginationModelChange={(m) => {
          if (page !== m.page) setPage(m.page);
          if (pageSize !== m.pageSize) setPageSize(m.pageSize);
        }}
        onSortModelChange={(m) => {
          setSort(m[0]);
        }}
        onRowSelectionModelChange={(newRowSelectionModel) => {
          // console.log( newRowSelectionModel )
          if (newRowSelectionModel.length > 0) {
            if (selectedAccount?._id === newRowSelectionModel[0]) {
              setRowSelectionModel([]);
              onRowSelected(null);
              return;
            }
            const trans = data.accounts.find(
              (v) => v._id === newRowSelectionModel[0]
            );
            // console.log(DateTime.fromISO(trans.date));
            onRowSelected({
              ...trans,
            });
          } else {
            onRowSelected(null);
          }
          setRowSelectionModel(newRowSelectionModel);
        }}
        rowSelectionModel={rowSelectionModel}
        slots={{ toolbar: DataGridCustomToolbar }}
        slotProps={{
          toolbar: { search, setSearch, searchInput, setSearchInput },
        }}
        getRowClassName={(params) => `status-theme--${params.row.type}`}
      />
    </Box>
  );
};

export default AccountsGrid;
