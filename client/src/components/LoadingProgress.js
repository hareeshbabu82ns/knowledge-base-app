import { Box, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';

export const LoadingProgress = ({ sx }) => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={sx}>
      <CircularProgress variant="indeterminate" />
    </Box>
  );
};

LoadingProgress.propTypes = {
  sx: PropTypes.object,
};
