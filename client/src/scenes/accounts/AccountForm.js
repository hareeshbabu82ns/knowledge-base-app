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
} from "@mui/icons-material";

import {
  useAddExpenseAccountMutation,
  useDeleteExpenseAccountMutation,
  useUploadAccountsMutation,
} from "state/api";
import { ACCOUNT_TYPES } from "constants";
import FileUploader from "components/FileUploader";

const AccountForm = ({ accountData, updateAccount }) => {
  const [formData, setFormData] = React.useState(accountData);

  const [addAccount] = useAddExpenseAccountMutation();
  const [deleteAccount] = useDeleteExpenseAccountMutation();
  const [accountsUpload] = useUploadAccountsMutation();

  const onInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAccoutsUpload = async (data) => {
    const file = data.filename;
    const { message } = await accountsUpload({
      file,
    }).unwrap();
    console.log(message);
  };

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
      toast.update(toastId, {
        render: "Account Deleted",
        type: "success",
        isLoading: false,
        autoClose: true,
      });
      setFormData(accountData);
      return payload;
    } catch (error) {
      toast.update(toastId, {
        render: "Account failed",
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
        ? await updateAccount({ id: formData?._id, ...postData })
        : await addAccount(postData).unwrap();
      toast.update(toastId, {
        render: "Account Saved",
        type: "success",
        isLoading: false,
        autoClose: true,
      });
      setFormData(accountData);
      return payload;
    } catch (error) {
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
        </Grid>

        <Grid item xs={12} sm={6}>
          <FileUploader
            uploadingItem="Account Config"
            prompt="Upload Account Config..."
            accept=".json"
            onFileUpload={(data) => handleAccoutsUpload(data)}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AccountForm;
