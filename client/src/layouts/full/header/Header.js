import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  styled,
  Stack,
  IconButton,
  useTheme,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';

// components
import Profile from './Profile.js';
// import { IconBellRinging, IconMenu } from '@tabler/icons';
import { DarkModeOutlined, Menu as IconMenu, LightModeOutlined } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import SettingsDrawerButton from 'components/SettingsDrawerButton.js';
import { setMode } from 'state/themeSlice.js';
import { headerSelector, subHeaderSelector } from 'state/index.js';

export const AppBarStyled = styled(AppBar)(({ theme }) => ({
  boxShadow: 'none',
  background: theme.palette.background.paper,
  justifyContent: 'center',
  backdropFilter: 'blur(4px)',
  [theme.breakpoints.up('lg')]: {
    minHeight: '70px',
  },
}));
export const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
  width: '100%',
  color: theme.palette.text.secondary,
}));

const Header = (props) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const header = useSelector(headerSelector);
  const subHeader = useSelector(subHeaderSelector);

  // const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  // const lgDown = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        <IconButton
          color="inherit"
          aria-label="menu"
          onClick={props.toggleMobileSidebar}
          sx={{
            display: {
              lg: 'none',
              xs: 'inline',
            },
          }}
        >
          <IconMenu width="20" height="20" />
        </IconButton>

        <Stack>
          {header && typeof header === 'string' && (
            <Typography
              variant="h4"
              color={theme.palette.text.onDefaultSecondary}
              fontWeight="bold"
            >
              {header}
            </Typography>
          )}
          {subHeader && typeof subHeader === 'string' && (
            <Typography variant="caption" color={theme.palette.text.onDefaultTertiary}>
              {subHeader}
            </Typography>
          )}
        </Stack>

        <Box flexGrow={1} />
        <Stack spacing={1} direction="row" alignItems="center">
          <IconButton onClick={() => dispatch(setMode())}>
            {theme.palette.isDark ? (
              <DarkModeOutlined sx={{ fontSize: '25px' }} />
            ) : (
              <LightModeOutlined sx={{ fontSize: '25px' }} />
            )}
          </IconButton>

          <SettingsDrawerButton />
          <Profile />
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

Header.propTypes = {
  sx: PropTypes.object,
};

export default Header;
