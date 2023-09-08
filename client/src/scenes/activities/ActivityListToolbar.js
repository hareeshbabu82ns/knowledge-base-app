import PropTypes from 'prop-types';
import { useState } from 'react';
import { IconButton, InputAdornment, Stack, TextField } from '@mui/material';
import NewIcon from '@mui/icons-material/AddOutlined';
import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import RefetchIcon from '@mui/icons-material/RefreshOutlined';
import SearchIcon from '@mui/icons-material/SearchOutlined';
import ClearIcon from '@mui/icons-material/ClearOutlined';

const IncidentListToolbar = ({ searchStr, onRefetch, onExport, onNewClicked, onSearch }) => {
  const [search, setSearch] = useState(searchStr);
  return (
    <Stack direction={'row'} gap={1} mx={2}>
      <TextField
        label="Search..."
        variant="standard"
        size="small"
        fullWidth
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          onSearch(e.target.value);
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => {
                  setSearch('');
                  onSearch('');
                }}
              >
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      {onExport && (
        <IconButton size="small" onClick={onExport}>
          <DownloadIcon />
        </IconButton>
      )}
      <IconButton size="small" onClick={onRefetch}>
        <RefetchIcon />
      </IconButton>
      <IconButton aria-label="comments" onClick={onNewClicked}>
        <NewIcon />
      </IconButton>
    </Stack>
  );
};

IncidentListToolbar.propTypes = {
  onRefetch: PropTypes.func,
  onExport: PropTypes.func,
  onNewClicked: PropTypes.func,
};

export default IncidentListToolbar;
