import {
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { toast } from "react-toastify";
import {
  SendOutlined,
  DeleteOutlineOutlined,
  AttachMoneyOutlined,
  ListAltOutlined as DefaultAccountIcon,
} from "@mui/icons-material";

import {
  useAddExpenseAccountMutation,
  useUpdateExpenseAccountMutation,
  useDeleteExpenseAccountMutation,
} from "state/api";
import { ACCOUNT_TYPES, BANK_ACCOUNTS_DEFAULT } from "constants";

const AccountForm = ({ accountData }) => {
  const [formData, setFormData] = React.useState(accountData);

  const [addAccount] = useAddExpenseAccountMutation();
  const [updateAccount] = useUpdateExpenseAccountMutation();
  const [deleteAccount] = useDeleteExpenseAccountMutation();

  const onInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // useEffect( () => {
  //   console.log( accountData )
  // }, [ accountData ] )

  const handleDelete = async () => {
    if (!formData?._id) {
      console.log(formData);
      toast.info("Select Account to delete first", { autoClose: true });
      return;
    }

    const toastId = toast.loading("Deleting Account...", {
      toastId: "account-del-action",
    });
    try {
      const payload = await deleteAccount(formData?._id).unwrap();
      // console.log( 'signup successful', payload )
      toast.update(toastId, {
        render: "Account Deleted",
        type: "success",
        isLoading: false,
        autoClose: true,
      });
      setFormData(accountData);
      return payload;
    } catch (error) {
      // console.error( 'signup failed', error );
      toast.update(toastId, {
        render: "Account failed",
        type: "error",
        isLoading: false,
        autoClose: true,
      });
    }
  };

  const handleCreateDefaultAccounts = async () => {
    const toastId = toast.loading("Creating Default Accounts...", {
      toastId: "account-def-action",
    });
    try {
      for (const defAccount of BANK_ACCOUNTS_DEFAULT) {
        await addAccount({ ...defAccount }).unwrap();
      }
      toast.update(toastId, {
        render: "Default Accounts created",
        type: "success",
        isLoading: false,
        autoClose: true,
      });
    } catch (error) {
      // console.error( 'signup failed', error );
      toast.update(toastId, {
        render: "Default Accounts creating failed",
        type: "error",
        isLoading: false,
        autoClose: true,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const postData = {
      type: formData.type,
      name: formData.name,
      description: formData.description,
    };

    const toastId = toast.loading("Saving Account...", {
      toastId: "account-add-action",
    });
    try {
      const payload = formData?._id
        ? await updateAccount({ id: formData?._id, ...postData }).unwrap()
        : await addAccount(postData).unwrap();
      // console.log( 'signup successful', payload )
      toast.update(toastId, {
        render: "Account Saved",
        type: "success",
        isLoading: false,
        autoClose: true,
      });
      setFormData(accountData);
      return payload;
    } catch (error) {
      // console.error( 'signup failed', error );
      toast.update(toastId, {
        render: "Account failed",
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
            name="name"
            required
            fullWidth
            id="name"
            label="Name"
            autoFocus
            value={formData.name}
            onChange={onInputChange}
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
            {ACCOUNT_TYPES.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </Select>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            name="description"
            fullWidth
            id="description"
            label="Description"
            value={formData.description}
            onChange={onInputChange}
            type="text"
            size="small"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <IconButton
            type="submit"
            onSubmit={handleSubmit}
            color="info"
            // disabled={formData._id}
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
          <IconButton
            type="button"
            onClick={handleCreateDefaultAccounts}
            color="success"
          >
            <DefaultAccountIcon />
          </IconButton>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AccountForm;
