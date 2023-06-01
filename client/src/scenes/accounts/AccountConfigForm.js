import {
  Button,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import FileFieldsGridForm from "./FileFieldsGridForm";
import IgnoreFieldsGridForm from "./IgnoreFieldsGridForm";
import TextAdjustFieldsGridForm from "./TextAdjustFieldsGridForm";

const CONFIG_INIT = {
  headerLines: 0,
  separator: ",",
  trimQuotes: false,
  fileFields: [],
  ignoreOps: [],
};
const AccountConfigForm = ({ account, onConfigUpdate }) => {
  const [formData, setFormData] = useState({
    ...(account?.config || CONFIG_INIT),
  });

  useEffect(() => {
    // console.log(account.config);
    setFormData({ ...(account?.config || CONFIG_INIT) });
  }, [account]);

  const [submitted, setSubmitted] = useState(false);

  const handleChange = ({ name, value }) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    await onConfigUpdate({ ...account, config: formData });
    setSubmitted(false);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          name="headerLines"
          required
          fullWidth
          type="number"
          id="headerLines"
          label="Header Lines"
          autoFocus
          value={formData.headerLines}
          onChange={(e) =>
            handleChange({ name: e.target.name, value: Number(e.target.value) })
          }
          size="small"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          name="separator"
          required
          fullWidth
          id="separator"
          label="Column Separator"
          value={formData.separator}
          onChange={(e) =>
            handleChange({ name: e.target.name, value: e.target.value })
          }
          size="small"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormControlLabel
          size="small"
          control={
            <Switch
              checked={formData.trimQuotes}
              onChange={(e) =>
                handleChange({ name: "trimQuotes", value: e.target.checked })
              }
            />
          }
          label="Trim Quotes"
        />
      </Grid>
      <Grid item xs={12}>
        <FileFieldsGridForm
          fileFields={formData.fileFields?.map((f) => ({ ...f, id: f._id }))}
          onConfigUpdated={({ rows }) =>
            handleChange({ name: "fileFields", value: rows })
          }
        />
      </Grid>
      <Grid item xs={12}>
        <IgnoreFieldsGridForm
          fields={account?.config?.ignoreOps.map((f) => ({ ...f, id: f._id }))}
          onConfigUpdated={({ rows }) =>
            handleChange({ name: "ignoreOps", value: rows })
          }
        />
      </Grid>
      <Grid item xs={12}>
        <TextAdjustFieldsGridForm
          fields={account?.config?.textToAdjust.map((f) => ({
            ...f,
            id: f._id,
          }))}
          onConfigUpdated={({ rows }) =>
            handleChange({ name: "textToAdjust", value: rows })
          }
        />
      </Grid>
      <Grid item xs={12}>
        <Button
          type="button"
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={submitted}
        >
          Update Config
        </Button>
      </Grid>
    </Grid>
  );
};

export default AccountConfigForm;
