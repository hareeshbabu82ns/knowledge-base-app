import { GridToolbarContainer } from '@mui/x-data-grid';
import PropTypes from 'prop-types';
import { IconButton, Button, Stack, Typography } from '@mui/material';
import NewIcon from '@mui/icons-material/CreateOutlined';
import RefetchIcon from '@mui/icons-material/RefreshOutlined';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';

const ActivityTrackToolbar = ({ onRefetch, onNewClicked }) => {
  return (
    <GridToolbarContainer>
      <Grid2 container flex={1} alignItems={'center'} mx={1}>
        <Grid2 xs={'auto'}>
          <Stack direction={'row'} spacing={2}>
            <Typography variant="h5">Activity Tracks</Typography>
            {onNewClicked && (
              <Button size="small" color="primary" startIcon={<NewIcon />} onClick={onNewClicked}>
                New
              </Button>
            )}
          </Stack>
        </Grid2>
        <Grid2 flexGrow={1} />
        <Grid2 xs={'auto'} gap={2}>
          <Stack direction={'row'} gap={1}>
            <IconButton size="small" onClick={onRefetch}>
              <RefetchIcon />
            </IconButton>
          </Stack>
        </Grid2>
      </Grid2>
    </GridToolbarContainer>
  );
};

ActivityTrackToolbar.propTypes = {
  onRefetch: PropTypes.func,
  onNewClicked: PropTypes.func,
};

export default ActivityTrackToolbar;
