import { Box, CircularProgress } from '@mui/material';
import PropTypes from 'prop-types';

export const LoadingProgress = ({ sx }) => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignContent="center"
      alignItems="center"
      minHeight="100vh"
      width="100%"
      sx={sx}
    >
      <CircularProgress variant="indeterminate" />
    </Box>
  );
};

LoadingProgress.propTypes = {
  sx: PropTypes.object,
};
