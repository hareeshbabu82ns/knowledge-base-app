import { useState } from 'react';
import {
  styled,
  Box,
  Typography,
  Stack,
  Chip,
  debounce,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { toast } from 'react-toastify';
import { DateTime } from 'luxon';

import { INTL_DATE_SHORT_OPTIONS } from 'constants';
import {
  useGetExpenseAccountsQuery,
  useGetExpenseTransactionsQuery,
  useRecalculateExpenseStatsMutation,
} from 'state/api';
import {
  getBackgroundColor,
  getHoverBackgroundColor,
  getSelectedBackgroundColor,
  getSelectedHoverBackgroundColor,
} from 'themes/utils';
import TransactionsGridToolbar from './TransactionsGridToolbar';
import { useNavigate } from 'react-router-dom';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { CalculateOutlined as ReCalcStatsIcon } from '@mui/icons-material';
import { dataGridFiltersToMDB } from 'utils';

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  '& .MuiDataGrid-root': {
    border: 'none',
  },
  '& .MuiDataGrid-cell': {
    borderBottom: 'none',
  },
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: getHoverBackgroundColor(theme.palette.primary[800], theme.palette.isDark),
    color: theme.palette.secondary[500],
    borderBottom: 'none',
    fontSize: 18,
  },
  '& .MuiDataGrid-footerContainer': {
    backgroundColor: getBackgroundColor(theme.palette.info.main, theme.palette.isDark),
    borderBottom: 'none',
    '& .MuiTablePagination-root': {
      color: theme.palette.secondary[300],
    },
  },
  '& .MuiDataGrid-toolbarContainer ': {
    backgroundColor: getBackgroundColor(theme.palette.info.main, theme.palette.isDark),
    '& .MuiButton-text': {
      color: `${theme.palette.secondary[800]} !important`,
    },
  },
  '& .MuiDataGrid-virtualScroller': {
    backgroundColor: getBackgroundColor(theme.palette.primary.light, theme.palette.isDark),
  },
  '& .status-theme--Income': {
    backgroundColor: getBackgroundColor(theme.palette.success.main, theme.palette.isDark),
    '&:hover': {
      backgroundColor: getHoverBackgroundColor(theme.palette.success.main, theme.palette.isDark),
    },
    '&.Mui-selected': {
      backgroundColor: getSelectedBackgroundColor(theme.palette.success.main, theme.palette.isDark),
      '&:hover': {
        backgroundColor: getSelectedHoverBackgroundColor(
          theme.palette.success.main,
          theme.palette.isDark,
        ),
      },
    },
  },
  '& .status-theme--Expense': {
    backgroundColor: getBackgroundColor(theme.palette.error.main, theme.palette.isDark),
    '&:hover': {
      backgroundColor: getHoverBackgroundColor(theme.palette.error.main, theme.palette.isDark),
    },
    '&.Mui-selected': {
      backgroundColor: getSelectedBackgroundColor(theme.palette.error.main, theme.palette.isDark),
      '&:hover': {
        backgroundColor: getSelectedHoverBackgroundColor(
          theme.palette.error.main,
          theme.palette.isDark,
        ),
      },
    },
  },
}));

const getColumns = ({ accounts }) => {
  const bankAccountFilters = accounts?.map((b) => ({ label: b.name, value: b._id, code: b._id }));
  const columns = [
    {
      field: '_id',
      headerName: 'ID',
      flex: 1,
    },
    // {
    //   field: 'userId',
    //   headerName: 'User Id',
    //   flex: 1,
    // },
    {
      field: 'type',
      headerName: 'Type',
      resizable: false,
      renderCell: ({ value }) => (
        <Typography variant="h6" color={value === 'Income' ? 'green' : 'error'}>
          {value}
        </Typography>
      ),
    },
    {
      field: 'date',
      headerName: 'Date',
      width: 120,
      type: 'date',
      valueGetter: ({ value }) => new Date(value),
      renderCell: ({ value }) => (
        <Typography variant="h6">{value.toLocaleString('en', INTL_DATE_SHORT_OPTIONS)}</Typography>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 100,
      type: 'number',
      renderCell: ({ value, row }) => (
        <Typography variant="h5" color={row.type === 'Expense' ? 'chocolate' : 'inherit'}>
          {Number(value).toFixed(2)}
        </Typography>
      ),
    },
    {
      field: 'account',
      headerName: 'Account',
      width: 120,
      valueGetter: ({ value }) => {
        return value?._id || value;
      },
      valueOptions: bankAccountFilters,
      type: 'singleSelect',
    },
    {
      field: 'tags',
      headerName: 'Tags',
      flex: 1,
      renderCell: ({ value }) => {
        return (
          <Stack direction="row" spacing={1}>
            {value.map((v, idx) => (
              <Chip
                key={`${v}_${idx}`}
                label={<Typography variant="body2">{v}</Typography>}
                variant="outlined"
              />
            ))}
          </Stack>
        );
      },
    },
  ];
  return columns;
};

const TransactionsGrid = () => {
  return (
    <Stack gap={2}>
      <TransactionsSearch />
      <TransactionsResult />
    </Stack>
  );
};

const TransactionsSearch = () => {
  const [reStatsYear, setReStatsYear] = useState(DateTime.now().year);

  const [recalculateStats] = useRecalculateExpenseStatsMutation();

  const handleReCalcStats = async () => {
    const toastId = toast.loading('Recalculating Transaction Stats...', {
      toastId: 'transaction-stats-action',
    });
    try {
      const payload = await recalculateStats({ year: reStatsYear }).unwrap();
      // console.log( 'signup successful', payload )
      toast.update(toastId, {
        render: 'Transaction Stats Recalculated',
        type: 'success',
        isLoading: false,
        autoClose: true,
      });
      return payload;
    } catch (error) {
      // console.error( 'signup failed', error );
      toast.update(toastId, {
        render: 'Failed to calculate Transaction Stats',
        type: 'error',
        isLoading: false,
        autoClose: true,
      });
    }
  };

  return (
    <Box>
      <Grid2 container>
        <Grid2 xs={12} sm={6} lg={4}>
          <Stack direction={'row'} gap={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="select-restat-year-label">ReCalculate Stats</InputLabel>
              <Select
                labelId="select-restat-year"
                name="reStats"
                id="select-restat-year"
                value={reStatsYear}
                label="Re-Stats"
                onChange={(e) => setReStatsYear(e.target.value)}
                required={true}
              >
                {Array.from({ length: 10 }, (_, i) => (
                  <MenuItem key={DateTime.now().year - i} value={DateTime.now().year - i}>
                    {DateTime.now().year - i}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton type="button" onClick={handleReCalcStats} color="warning">
              <ReCalcStatsIcon />
            </IconButton>
          </Stack>
        </Grid2>
      </Grid2>
    </Box>
  );
};

const TransactionsResult = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [sort, setSort] = useState({});
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState([]);
  const navigate = useNavigate();

  // const [rowSelectionModel, setRowSelectionModel] = useState([]);

  const { data: bankAccounts, isLoading: bankAccountsLoading } = useGetExpenseAccountsQuery({});

  const { data, isLoading } = useGetExpenseTransactionsQuery({
    page,
    pageSize,
    sort: JSON.stringify(sort),
    filters: JSON.stringify(dataGridFiltersToMDB(filters)),
    search,
  });

  return (
    <Box height="75vh" width="100%">
      <StyledDataGrid
        loading={isLoading || bankAccountsLoading || !data}
        rows={data?.transactions || []}
        rowSelection={true}
        getRowId={(row) => row._id}
        columns={getColumns({ accounts: bankAccounts?.accounts })}
        rowCount={data?.total || 0}
        pagination
        page={page}
        initialState={{
          filter: {
            filterModel: { items: filters },
          },
          pagination: {
            paginationModel: { pageSize, page },
          },
          columns: {
            columnVisibilityModel: {
              type: false,
              _id: false,
            },
          },
        }}
        paginationMode="server"
        sortingMode="server"
        filterMode="server"
        onPaginationModelChange={(m) => {
          if (page !== m.page) setPage(m.page);
          if (pageSize !== m.pageSize) setPageSize(m.pageSize);
        }}
        onSortModelChange={(m) => {
          setSort(m[0]);
        }}
        onFilterModelChange={(newFilterModel) => {
          setFilters(newFilterModel.items);
        }}
        disableRowSelectionOnClick={true}
        // onRowSelectionModelChange={(newRowSelectionModel) => {
        //   // console.log( newRowSelectionModel )
        //   if (newRowSelectionModel.length > 0) {
        //     if (selectedTransaction?._id === newRowSelectionModel[0]) {
        //       setRowSelectionModel([]);
        //       onRowSelected(null);
        //       return;
        //     }
        //     const trans = data.transactions.find((v) => v._id === newRowSelectionModel[0]);
        //     // console.log(DateTime.fromISO(trans.date));
        //     onRowSelected({
        //       ...trans,
        //       tags: trans.tags.join(','),
        //       date: DateTime.fromISO(trans.date),
        //     });
        //   } else {
        //     onRowSelected(null);
        //   }
        //   setRowSelectionModel(newRowSelectionModel);
        // }}
        // rowSelectionModel={rowSelectionModel}
        slots={{ toolbar: TransactionsGridToolbar }}
        slotProps={{
          toolbar: { onSearch: debounce(setSearch, 500) },
        }}
        // getRowClassName={(params) => `status-theme--${params.row.type}`}
        onRowDoubleClick={({ id }) => navigate(id)}
      />
    </Box>
  );
};

export default TransactionsGrid;
