import {
  Button,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import { EXPENSE_TYPES } from "constants";
import React, { forwardRef } from "react";
import DatePicker from "react-datepicker";
import { toast } from "react-toastify";
import { DateTime } from "luxon";
import {
  SendOutlined,
  DeleteOutlineOutlined,
  AttachMoneyOutlined,
  LocalOfferOutlined,
  CalendarMonthOutlined,
} from "@mui/icons-material";
// import "react-datepicker/dist/react-datepicker.css"

import {
  useAddExpenseTransactionMutation,
  useUpdateExpenseTransactionMutation,
  useDeleteExpenseTransactionMutation,
} from "state/api";

// const initFormData = {
//   amount: Math.random() * 134,
//   type: EXPENSE_TYPES[ 0 ],
//   tags: 'ui,test',
//   date: DateTime.local(),
// }
// const initFormData = {
//   amount: 0,
//   type: EXPENSE_TYPES[ 0 ],
//   tags: '',
//   date: DateTime.local(),
// }

const DateButton = forwardRef(({ value, onClick }, ref) => (
  <Button
    variant="outlined"
    startIcon={<CalendarMonthOutlined />}
    fullWidth
    sx={{ py: 0.9 }}
    color="secondary"
    size="small"
    onClick={onClick}
    ref={ref}
  >
    {value}
  </Button>
));

const TransactionForm = ({ transactionData }) => {
  const [formData, setFormData] = React.useState(transactionData);

  const [addTransaction] = useAddExpenseTransactionMutation();
  const [updateTransaction] = useUpdateExpenseTransactionMutation();
  const [deleteTransaction] = useDeleteExpenseTransactionMutation();

  const onInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // useEffect( () => {
  //   console.log( transactionData )
  // }, [ transactionData ] )

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
      date: DateTime.fromJSDate(formData.date),
      // dateUTC: formData.date.toUTCString(),
    };

    console.log("selected date: ", formData.date);
    console.log("utc date: ", formData.date.toUTCString());
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
        <Grid item xs={12} sm={6}>
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
        <Grid item xs={12} sm={6}>
          <Select
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
          </Select>
        </Grid>
        <Grid item xs={12} sm={6}>
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
        <Grid item xs={9} sm={4}>
          <DatePicker
            name="date"
            id="date"
            selected={formData.date}
            showTimeSelect
            timeIntervals={15}
            timeFormat="p"
            dateFormat="Pp"
            showMonthDropdown
            showYearDropdown
            onChange={(date) =>
              onInputChange({ target: { name: "date", value: date } })
            }
            customInput={<DateButton />}
          />
        </Grid>
        <Grid item xs={3} sm={2}>
          <IconButton type="submit" onSubmit={handleSubmit} color="info">
            <SendOutlined />
          </IconButton>
          <IconButton type="button" onClick={handleDelete} color="warning">
            <DeleteOutlineOutlined />
          </IconButton>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TransactionForm;
