import * as React from "react";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import { useGetTagsQuery } from "state/api";
import { Autocomplete, Chip, TextField } from "@mui/material";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export default function ExpenseTagsSelect({
  freeSolo = false,
  size,
  onChange,
  value = [],
}) {
  const [search, setSearch] = React.useState("");
  const { data } = useGetTagsQuery({ search });
  const [tags, setTags] = React.useState(
    typeof value === "string"
      ? value.trim().length > 0
        ? value.split(",")
        : []
      : value
  );

  const handleChange = (value) => {
    // const {
    //   target: { value },
    // } = event;
    // On autofill we get a stringified value.
    console.log(value);
    const val = typeof value === "string" ? value.split(",") : value;
    setTags(val);
    onChange(val);
  };

  return (
    <Autocomplete
      multiple
      id="tags-filled"
      options={data?.tags || []}
      // defaultValue={tags}
      value={tags}
      freeSolo={freeSolo}
      size={size}
      onChange={(event, newValue) => {
        handleChange(newValue);
      }}
      renderTags={
        // (value, getTagProps) => value.join(",")
        (value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              size={size}
              variant="outlined"
              label={option}
              {...getTagProps({ index })}
            />
          ))
      }
      renderInput={(params) => {
        // console.log(params);
        return (
          <TextField
            {...params}
            variant="outlined"
            label="Tags"
            placeholder="Tags"
          />
        );
      }}
    />
  );
}
