import * as React from 'react';
import { Autocomplete, Chip, TextField } from '@mui/material';
import { useGetIncidentTagsQuery } from 'state/incidentSlice';

export default function IncidentTagsSelect({ freeSolo = false, size, onChange, value = [] }) {
  const [search, setSearch] = React.useState('');
  const { data } = useGetIncidentTagsQuery({ search });
  const [tags, setTags] = React.useState(
    typeof value === 'string' ? (value.trim().length > 0 ? value.split(',') : []) : value,
  );

  React.useEffect(() => {
    setTags(typeof value === 'string' ? (value.trim().length > 0 ? value.split(',') : []) : value);
  }, [value]);

  const handleChange = (value) => {
    // const {
    //   target: { value },
    // } = event;
    // On autofill we get a stringified value.
    // console.log(value);
    const val = typeof value === 'string' ? value.split(',') : value;
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
            <Chip size={size} variant="outlined" label={option} {...getTagProps({ index })} />
          ))
      }
      renderInput={(params) => {
        // console.log(params);
        return <TextField {...params} variant="outlined" label="Tags" placeholder="Tags" />;
      }}
    />
  );
}
