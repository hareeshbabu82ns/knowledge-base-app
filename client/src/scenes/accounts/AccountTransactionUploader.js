import {
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { DataGrid } from "@mui/x-data-grid";
import { INTL_DATE_LONG_OPTIONS } from "constants";
import React, { useEffect, useState } from "react";
import {
  useProcessUploadMutation,
  useTransactionsUploadMutation,
  useGetExpenseAccountsQuery,
} from "state/api";

const AccountTransactionUploader = ({ account }) => {
  const [selectedFile, setSelectedFile] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [config, setConfig] = useState(null);
  const [dataToUpload, setDataToUpload] = useState(null);
  const [dataMdb, setDataMdb] = useState(null);

  useEffect(() => {
    setBankAccount(account?._id);
  }, [account]);

  const { data: bankAccounts, isLoading: bankAccountsLoading } =
    useGetExpenseAccountsQuery({});

  const [uploadTransactions] = useTransactionsUploadMutation();
  const [processUpload] = useProcessUploadMutation();

  const onFileSelected = (event) => {
    // console.log(event.target.files[0]);
    setSelectedFile(event.target.files[0]);
  };

  const onBankAccountSelected = (event) => {
    setBankAccount(event.target.value);
  };

  const onUpload = async () => {
    // prepare file for upload
    const data = new FormData();
    data.append("file", selectedFile);

    const toastId = toast.loading("Uploading Transactions...", {
      toastId: "trans-upl-action",
    });

    try {
      // send file to server
      const res = await uploadTransactions(data).unwrap();
      // receive two parameter endpoint url ,form data
      // console.log(res);
      const file = res.filename;

      const {
        message,
        data: resData,
        dataMdb: resDataMdb,
        config,
      } = await processUpload({
        file,
        bankAccount,
      }).unwrap();
      console.log(message, resData, config, resDataMdb);
      if (config || resData) {
        setConfig(config);
        setDataToUpload(resData);
        setDataMdb(resDataMdb);
      } else {
        setConfig(null);
        setDataToUpload(null);
        setDataMdb(null);
      }

      toast.update(toastId, {
        render: "Transactions Uploaded",
        type: "success",
        isLoading: false,
        autoClose: true,
      });
    } catch (e) {
      toast.update(toastId, {
        render: "Upload failed",
        type: "error",
        isLoading: false,
        autoClose: true,
      });
    }
  };

  return (
    <Box sx={{ px: 4 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <input type="file" name="file" onChange={onFileSelected} />
        </Grid>
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
                <MenuItem value={""}>{"Loading..."}</MenuItem>
              ) : (
                bankAccounts?.accounts?.map((c) => (
                  <MenuItem value={c._id}>{c.name}</MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <Button variant="contained" onClick={onUpload}>
            Upload
          </Button>
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
    renderCell: ({ value }) =>
      f.type === "amount" ? `$ ${Number(value).toFixed(2)}` : value,
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
    field: "type",
    headerName: "Type",
    resizable: false,
    renderCell: ({ value }) => (
      <Typography variant="h6" color={value === "Income" ? "green" : "error"}>
        {value}
      </Typography>
    ),
  },
  {
    field: "description",
    headerName: "Descripiton",
    resizable: false,
    flex: 2.5,
  },
  {
    field: "date",
    headerName: "Transaction Date",
    flex: 1,
    renderCell: ({ value }) => (
      <Typography variant="h6">
        {new Date(value).toLocaleString("en", INTL_DATE_LONG_OPTIONS)}
      </Typography>
    ),
  },
  {
    field: "amount",
    headerName: "Amount",
    flex: 0.5,
    renderCell: ({ value }) => (
      <Typography variant="h5">{Number(value).toFixed(2)}</Typography>
    ),
  },
  {
    field: "tags",
    headerName: "Tags",
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
