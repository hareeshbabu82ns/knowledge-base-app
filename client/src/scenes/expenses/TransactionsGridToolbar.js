import { Button, FormControl, IconButton, InputAdornment, Stack, TextField } from '@mui/material';
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from '@mui/x-data-grid';
import React, { useState } from 'react';
import {
  DownloadOutlined as DownloadIcon,
  ClearOutlined,
  CurrencyRupeeOutlined as SaveIcon,
} from '@mui/icons-material';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { useNavigate } from 'react-router-dom';

function TransactionsGridToolbar({ onSearch, onExport }) {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    onSearch(e.target.value);
  };

  const toolBarActions = (
    <Stack direction={'row'} gap={1}>
      {/* <GridToolbarColumnsButton /> */}
      {/* <GridToolbarDensitySelector /> */}
      {!onExport && <GridToolbarExport />}
      <Button startIcon={<SaveIcon />} onClick={() => navigate('new')}>
        New
      </Button>
    </Stack>
  );

  const expenseSearchInput = (
    <FormControl fullWidth size="small">
      <TextField
        label={'Search ...'}
        variant="standard"
        size="small"
        onChange={handleSearchChange}
        value={searchInput}
        InputProps={{
          sx: { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },
          endAdornment: (
            <InputAdornment position="end">
              {searchInput?.length > 0 && (
                <IconButton
                  size="small"
                  onClick={() => {
                    setSearchInput('');
                    onSearch('');
                  }}
                >
                  <ClearOutlined />
                </IconButton>
              )}
            </InputAdornment>
          ),
        }}
      />
    </FormControl>
  );

  return (
    <GridToolbarContainer>
      <Grid2 container flex={1} alignItems={'center'} px={1} py={1}>
        <Grid2 xs={12} md={4}>
          {toolBarActions}
        </Grid2>
        <Grid2 sx={{ flexGrow: 1 }}></Grid2>
        <Grid2 xs={12} md={4} container>
          {expenseSearchInput}
          {onExport && (
            <IconButton size="small" onClick={onExport}>
              <DownloadIcon />
            </IconButton>
          )}
        </Grid2>
      </Grid2>
    </GridToolbarContainer>
  );
}

export default TransactionsGridToolbar;
