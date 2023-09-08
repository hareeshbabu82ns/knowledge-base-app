import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import BackIcon from '@mui/icons-material/ArrowBackOutlined';
import { useNavigate } from 'react-router-dom';

const Panel = ({
  title,
  titleIcon,
  toolbarActions,
  children,
  actionsLeft,
  actionsRight,
  loading,
  error,
  titleVarient = 'dense',
  showHistoryBack,
  sx,
}) => {
  const LoadingPanel = () => (
    <Box sx={{ border: 1, borderRadius: 1, borderColor: 'grey.800' }}>
      <Titlebar {...{ title, toolbarActions, titleVarient, titleIcon, showHistoryBack }} />

      <Paper
        sx={{
          p: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress variant="indeterminate" />
      </Paper>
    </Box>
  );

  const ErrorPanel = ({ error, sx }) => (
    <Box sx={{ border: 1, borderRadius: 1, borderColor: 'grey.800', ...sx }}>
      <Titlebar {...{ title, toolbarActions, titleVarient, titleIcon, showHistoryBack }} />

      <Paper
        sx={{
          p: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Alert severity="warning" variant="outlined">
          <AlertTitle>{'Error :('}</AlertTitle>
          <Typography variant="body2">{error?.message}</Typography>
        </Alert>
      </Paper>
    </Box>
  );

  if (loading) return <LoadingPanel />;
  if (error) return <ErrorPanel {...{ error }} />;

  return (
    <React.Suspense fallback={<LoadingPanel />}>
      <Box sx={{ border: 1, borderRadius: 1, borderColor: 'grey.800', ...sx }}>
        <Titlebar {...{ title, toolbarActions, titleVarient, titleIcon, showHistoryBack }} />

        <Paper sx={{ p: 2 }}>
          {children}

          {(actionsLeft || actionsRight) && (
            <Stack
              sx={{ pt: 1, mt: 2, borderTop: 1, borderColor: 'grey.400' }}
              direction="row"
              spacing={2}
              // justifyContent="flex-end"
            >
              {(actionsLeft || actionsRight) && <Box sx={{ flexGrow: 1 }}>{actionsLeft}</Box>}
              {actionsRight && <Box>{actionsRight}</Box>}
            </Stack>
          )}
        </Paper>
      </Box>
    </React.Suspense>
  );
};

export default Panel;

Panel.propTypes = {
  title: PropTypes.string,
  titleIcon: PropTypes.node,
  toolbarActions: PropTypes.node,
  children: PropTypes.node,
  actionsLeft: PropTypes.node,
  actionsRight: PropTypes.node,
  loading: PropTypes.bool,
  error: PropTypes.object,
  titleVarient: PropTypes.string,
  showHistoryBack: PropTypes.string,
  sx: PropTypes.object,
};

const Titlebar = ({ title, toolbarActions, titleVarient, titleIcon, showHistoryBack }) => {
  const navigate = useNavigate();
  return title || toolbarActions ? (
    <Toolbar
      sx={{
        backgroundColor: 'primary.50',
        borderRadius: 1,
        borderEndStartRadius: 0,
        borderEndEndRadius: 0,
      }}
      variant={titleVarient}
      disableGutters
    >
      <Stack sx={{ flexGrow: 1 }} direction="row" spacing={1} alignItems={'center'}>
        {showHistoryBack && (
          <IconButton onClick={() => navigate(showHistoryBack?.length > 0 ? showHistoryBack : -1)}>
            <BackIcon />
          </IconButton>
        )}
        {titleIcon}
        {typeof title === 'string' ? (
          <Typography variant="h6" sx={{ flexGrow: 1, pl: 1 }}>
            {title}
          </Typography>
        ) : (
          <Box sx={{ flexGrow: 1 }}>{title}</Box>
        )}
      </Stack>
      <Stack direction="row" spacing={1}>
        {toolbarActions}
      </Stack>
    </Toolbar>
  ) : null;
};

Titlebar.propTypes = {
  title: PropTypes.string,
  titleIcon: PropTypes.node,
  toolbarActions: PropTypes.node,
  titleVarient: PropTypes.string,
  showHistoryBack: PropTypes.string,
};
