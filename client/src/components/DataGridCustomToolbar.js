import { Search } from "@mui/icons-material";
import { IconButton, InputAdornment, Stack, TextField } from "@mui/material";
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from "@mui/x-data-grid";
import React from "react";
import FlexBetween from "./FlexBetween";
import { DownloadOutlined as DownloadIcon } from "@mui/icons-material";

function DataGridCustomToolbar({
  searchInput,
  setSearchInput,
  search,
  setSearch,
  onExport,
}) {
  return (
    <GridToolbarContainer>
      <FlexBetween width="100%">
        <FlexBetween>
          <GridToolbarColumnsButton />
          <GridToolbarDensitySelector />
          {!onExport && <GridToolbarExport />}
        </FlexBetween>
        <Stack direction={"row"} gap={1}>
          <TextField
            label="Search..."
            sx={{ mb: "0.5rem", width: "15rem" }}
            variant="standard"
            size="small"
            onChange={(e) => setSearchInput(e.target.value)}
            value={searchInput}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSearch(searchInput);
                      // setSearchInput( '' )
                    }}
                  >
                    <Search />
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
        </Stack>
      </FlexBetween>
    </GridToolbarContainer>
  );
}

export default DataGridCustomToolbar;
