import {
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
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
} from "@mui/icons-material";

import {
  useAddExpenseTransactionMutation,
  useUpdateExpenseTransactionMutation,
  useDeleteExpenseTransactionMutation,
} from "state/api";
import { DateTimePicker } from "@mui/x-date-pickers";

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
      date: formData.date,
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
            disabled={formData._id} // update is not yet possible, delete and add entry instead
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
      </Grid>
    </Box>
  );
};

export default TransactionForm;
