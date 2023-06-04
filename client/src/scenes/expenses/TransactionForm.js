import {
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import { EXPENSE_TYPES } from "constants";
import React from "react";
import { toast } from "react-toastify";
import {
  SendOutlined,
  DeleteOutlineOutlined,
  AttachMoneyOutlined,
  LocalOfferOutlined,
  CalculateOutlined as ReCalcStatsIcon,
} from "@mui/icons-material";
import { DateTime } from "luxon";
import {
  useAddExpenseTransactionMutation,
  useUpdateExpenseTransactionMutation,
  useDeleteExpenseTransactionMutation,
  useGetExpenseAccountsQuery,
  useRecalculateExpenseStatsMutation,
} from "state/api";
import { DateTimePicker } from "@mui/x-date-pickers";

const TransactionForm = ({ transactionData }) => {
  const [formData, setFormData] = React.useState(transactionData);
  const [reStatsYear, setReStatsYear] = React.useState(DateTime.now().year);

  const [recalculateStats] = useRecalculateExpenseStatsMutation();
  const [addTransaction] = useAddExpenseTransactionMutation();
  const [updateTransaction] = useUpdateExpenseTransactionMutation();
  const [deleteTransaction] = useDeleteExpenseTransactionMutation();

  const { data: bankAccounts, isLoading: bankAccountsLoading } =
    useGetExpenseAccountsQuery({});

  const onInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleReCalcStats = async () => {
    const toastId = toast.loading("Recalculating Transaction Stats...", {
      toastId: "transaction-stats-action",
    });
    try {
      const payload = await recalculateStats({ year: reStatsYear }).unwrap();
      // console.log( 'signup successful', payload )
      toast.update(toastId, {
        render: "Transaction Stats Recalculated",
        type: "success",
        isLoading: false,
        autoClose: true,
      });
      return payload;
    } catch (error) {
      // console.error( 'signup failed', error );
      toast.update(toastId, {
        render: "Failed to calculate Transaction Stats",
        type: "error",
        isLoading: false,
        autoClose: true,
      });
    }
  };

  const handleDelete = async () => {
    if (!formData?._id) {
      console.log(formData);
      toast.info("Select Transaction to delete first", { autoClose: true });
      return;
    }

    const toastId = toast.loading("Deleting Transaction...", {
      toastId: "transaction-del-action",
    });
    try {
      const payload = await deleteTransaction(formData?._id).unwrap();
      // console.log( 'signup successful', payload )
      toast.update(toastId, {
        render: "Transaction Deleted",
        type: "success",
        isLoading: false,
        autoClose: true,
      });
      setFormData(transactionData);
      return payload;
    } catch (error) {
      // console.error( 'signup failed', error );
      toast.update(toastId, {
        render: "Transaction failed",
        type: "error",
        isLoading: false,
        autoClose: true,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const postData = {
      amount: Number(formData.amount),
      type: formData.type,
      tags: formData.tags.split(",").map((t) => t.trim()),
      date: formData.date,
      account: formData.account,
      description: formData.description,
      // dateUTC: formData.date.toUTCString(),
    };

    console.log("selected date: ", formData.date);
    console.log("utc date: ", formData.date.toISO());
    console.log("form local date: ", postData.date);

    const toastId = toast.loading("Saving Transaction...", {
      toastId: "transaction-add-action",
    });
    try {
      const payload = formData?._id
        ? await updateTransaction({ id: formData?._id, ...postData }).unwrap()
        : await addTransaction(postData).unwrap();
      // console.log( 'signup successful', payload )
      toast.update(toastId, {
        render: "Transaction Saved",
        type: "success",
        isLoading: false,
        autoClose: true,
      });
      setFormData(transactionData);
      return payload;
    } catch (error) {
      // console.error( 'signup failed', error );
      toast.update(toastId, {
        render: "Transaction failed",
        type: "error",
        isLoading: false,
        autoClose: true,
      });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} lg={3}>
          <TextField
            name="amount"
            required
            fullWidth
            id="amount"
            label="Amount"
            autoFocus
            value={formData.amount}
            onChange={onInputChange}
            type="number"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AttachMoneyOutlined />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={1}>
          <Switch
            id="type"
            name="type"
            label="Type"
            checked={formData.type === EXPENSE_TYPES[0]}
            onChange={(e) =>
              onInputChange({
                target: {
                  name: "type",
                  value: e.target.checked ? EXPENSE_TYPES[0] : EXPENSE_TYPES[1],
                },
              })
            }
            size="small"
          />
          {/* <Select
            id="type"
            name="type"
            label="Type"
            fullWidth
            value={formData.type}
            onChange={onInputChange}
            size="small"
          >
            {EXPENSE_TYPES.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </Select> */}
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <TextField
            name="tags"
            required
            fullWidth
            id="tags"
            label="Tags (',' delimited)"
            autoFocus
            value={formData.tags}
            onChange={onInputChange}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocalOfferOutlined />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth size="small">
            <InputLabel id="select-bank-account-label">Bank Account</InputLabel>
            <Select
              labelId="select-bank-account"
              name="account"
              id="select-bank-account"
              value={formData.account}
              label="Bank Account"
              onChange={onInputChange}
              required={true}
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
        <Grid item xs={6}>
          <TextField
            name="description"
            required
            fullWidth
            id="description"
            label="Description"
            value={formData.description}
            onChange={onInputChange}
            type="text"
            size="small"
          />
        </Grid>
        <Grid item xs={9} sm={4} lg={3}>
          <DateTimePicker
            name="date"
            id="date"
            format="LLL dd yyyy hh:mm a"
            label="Transaction Date"
            value={formData.date}
            onChange={(date) =>
              onInputChange({ target: { name: "date", value: date } })
            }
            slotProps={{
              field: {
                size: "small",
                fullWidth: true,
                required: true,
              },
            }}
          />
        </Grid>

        <Grid item xs={3} sm={2}>
          <IconButton
            type="submit"
            onSubmit={handleSubmit}
            color="info"
            // disabled={formData._id} // update is not yet possible, delete and add entry instead
          >
            <SendOutlined />
          </IconButton>
          <IconButton
            type="button"
            onClick={handleDelete}
            color="warning"
            disabled={!formData._id}
          >
            <DeleteOutlineOutlined />
          </IconButton>
        </Grid>

        <Grid item xs={12} sm={6} lg={4}>
          <Stack direction={"row"} gap={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="select-restat-year-label">
                ReCalculate Stats
              </InputLabel>
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
                  <MenuItem
                    key={DateTime.now().year + i}
                    value={DateTime.now().year + i}
                  >
                    {DateTime.now().year + i}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton
              type="button"
              onClick={handleReCalcStats}
              color="warning"
            >
              <ReCalcStatsIcon />
            </IconButton>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TransactionForm;
