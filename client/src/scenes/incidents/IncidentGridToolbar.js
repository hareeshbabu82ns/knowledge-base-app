import {
  // GridToolbarColumnsButton,
  GridToolbarContainer,
  // GridToolbarDensitySelector,
  GridToolbarExport,
} from '@mui/x-data-grid';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { IconButton, Button, InputAdornment, Stack, TextField, Icon } from '@mui/material';
import NewIcon from '@mui/icons-material/CreateOutlined';
import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import RefetchIcon from '@mui/icons-material/RefreshOutlined';
import SearchIcon from '@mui/icons-material/SearchOutlined';
import ClearIcon from '@mui/icons-material/ClearOutlined';
import AddIcon from '@mui/icons-material/AddOutlined';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';

const IncidentGridToolbar = ({ onRefetch, onExport, onAddIncident, onNewClicked, onSearch }) => {
  const [incident, setIncident] = useState('');
  const [search, setSearch] = useState('');
  return (
    <GridToolbarContainer>
      <Grid2 container flex={1} alignItems={'center'} mx={1}>
        <Grid2 xs={'auto'}>
          <Stack direction={'row'} spacing={2}>
            {/* <GridToolbarColumnsButton /> */}
            {/* <GridToolbarDensitySelector /> */}
            <Button size="small" color="primary" startIcon={<NewIcon />} onClick={onNewClicked}>
              New
            </Button>
            {!onExport && <GridToolbarExport />}
          </Stack>
        </Grid2>
        <Grid2 flexGrow={1} />
        <Grid2 xs={'auto'} gap={2}>
          <Stack direction={'row'} gap={1}>
            <TextField
              label="Search..."
              variant="standard"
              size="small"
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
            {/* <TextField
              label="Add Incident..."
              variant="standard"
              size="small"
              onChange={(e) => setIncident(e.target.value)}
              value={incident}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={async () => {
                        await onAddIncident(incident);
                        setIncident('');
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            /> */}
            {onExport && (
              <IconButton size="small" onClick={onExport}>
                <DownloadIcon />
              </IconButton>
            )}
            <IconButton size="small" onClick={onRefetch}>
              <RefetchIcon />
            </IconButton>
          </Stack>
        </Grid2>
      </Grid2>
    </GridToolbarContainer>
  );
};

IncidentGridToolbar.propTypes = {
  onRefetch: PropTypes.func,
  onExport: PropTypes.func,
  onAddIncident: PropTypes.func,
  onNewClicked: PropTypes.func,
};

export default IncidentGridToolbar;
