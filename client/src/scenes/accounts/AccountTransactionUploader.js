import {
  Box,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { INTL_DATE_LONG_OPTIONS } from 'constants';
import React, { useEffect, useState } from 'react';
import { useUploadTransactionsMutation, useGetExpenseAccountsQuery } from 'state/api';
import FileUploader from 'components/FileUploader';

const AccountTransactionUploader = ({ account }) => {
  const [bankAccount, setBankAccount] = useState('');
  const [config, setConfig] = useState(null);
  const [dataToUpload, setDataToUpload] = useState(null);
  const [dataMdb, setDataMdb] = useState(null);

  useEffect(() => {
    setBankAccount(account?._id);
  }, [account]);

  const { data: bankAccounts, isLoading: bankAccountsLoading } = useGetExpenseAccountsQuery({});

  const [uploadTransactions] = useUploadTransactionsMutation();

  const onBankAccountSelected = (event) => {
    setBankAccount(event.target.value);
  };

  const onUpload = async (data) => {
    const { filename: file } = data;
    const {
      data: resData,
      dataMdb: resDataMdb,
      config,
    } = await uploadTransactions({
      file,
      bankAccount,
    }).unwrap();
    // console.log(message, resData, config, resDataMdb);

    if (config || resData) {
      setConfig(config);
      setDataToUpload(resData);
      setDataMdb(resDataMdb);
    } else {
      setConfig(null);
      setDataToUpload(null);
      setDataMdb(null);
    }
  };

  return (
    <Box sx={{ px: 4 }}>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <FormControl fullWidth size="small">
            <InputLabel id="select-bank-account-label">Bank Account</InputLabel>
            <Select
              labelId="select-bank-account"
              id="select-bank-account"
              value={bankAccount}
              label="Bank Account"
              onChange={onBankAccountSelected}
            >
              {bankAccountsLoading ? (
                <MenuItem value={''}>{'Loading...'}</MenuItem>
              ) : (
                bankAccounts?.accounts?.map((c) => <MenuItem value={c._id}>{c.name}</MenuItem>)
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={8}>
          <FileUploader
            uploadingItem="Transactions"
            prompt="Upload Transactions..."
            accept=".csv"
            onFileUpload={onUpload}
          />
        </Grid>

        <Grid item xs={12}>
          {config && <ResultMDBTable config={config} data={dataMdb} />}
        </Grid>
        <Grid item xs={12}>
          {config && <ResultUploadTable config={config} data={dataToUpload} />}
        </Grid>
      </Grid>
    </Box>
  );
};

const ResultUploadTable = ({ config, data }) => {
  const columns = config.fileFields.map((f) => ({
    field: f.name,
    headerName: f.name,
    flex: 1,
    renderCell: ({ value }) => (f.type === 'amount' ? `$ ${Number(value).toFixed(2)}` : value),
  }));

  return (
    <Box>
      <DataGrid
        loading={!data}
        rows={data || []}
        getRowId={(row) =>
          `${row?.transactionDate}-${row?.extendedText}-${row?.description}-${row?.creditAmount}-${row?.debitAmount}-${row?.amount}`
        }
        columns={columns}
        rowCount={data.length || 0}
        pagination
      />
    </Box>
  );
};

const columnsMDB = [
  // {
  //   field: "_id",
  //   headerName: "ID",
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
    field: 'description',
    headerName: 'Descripiton',
    resizable: false,
    flex: 2.5,
  },
  {
    field: 'date',
    headerName: 'Transaction Date',
    flex: 1,
    renderCell: ({ value }) => (
      <Typography variant="h6">
        {new Date(value).toLocaleString('en', INTL_DATE_LONG_OPTIONS)}
      </Typography>
    ),
  },
  {
    field: 'amount',
    headerName: 'Amount',
    flex: 0.5,
    renderCell: ({ value }) => <Typography variant="h5">{Number(value).toFixed(2)}</Typography>,
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

const ResultMDBTable = ({ data }) => {
  return (
    <Box>
      <DataGrid
        loading={!data}
        rows={data || []}
        getRowId={(row) => `${row?.type}-${row?.date}-${row?.amount}`}
        columns={columnsMDB}
        rowCount={data.length || 0}
        pagination
        initialState={{
          pagination: {
            paginationModel: { pageSize: 25 },
          },
          columns: {
            columnVisibilityModel: {
              _id: false,
            },
          },
        }}
      />
    </Box>
  );
};

export default AccountTransactionUploader;
