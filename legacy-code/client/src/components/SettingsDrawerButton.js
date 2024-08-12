import { DarkModeOutlined, LightModeOutlined, SettingsOutlined } from '@mui/icons-material';
import LockIcon from '@mui/icons-material/LockOutlined';

import {
  Box,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import ThemeGenerator from 'themes/ThemeGenerator';
import { useTheme } from '@emotion/react';
import { useDispatch, useSelector } from 'react-redux';
import { setMode } from 'state/themeSlice';
import { encryptionKeySelector, setEncryption } from 'state';

const SettingsDrawerButton = () => {
  const theme = useTheme();
  const encKey = useSelector(encryptionKeySelector);

  const dispatch = useDispatch();
  const [isDrawerVisible, setDrawerVisible] = useState(false);

  const toggleDrawer = () => {
    setDrawerVisible(!isDrawerVisible);
  };

  const encKeyTextInput = (
    <Box sx={{ p: 2, flex: 1 }}>
      <TextField
        id="enc-key-input"
        label="Encryption Key"
        variant="outlined"
        fullWidth
        required
        value={encKey}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon />
            </InputAdornment>
          ),
        }}
        onChange={(e) => dispatch(setEncryption(e.target.value))}
      />
    </Box>
  );

  const drawerItems = () => (
    <Box sx={{ width: { xs: 250, md: 350 } }} role="presentation">
      <List>
        <ListItem sx={{ bgcolor: theme.palette.tertiary[700], px: 2, py: 1.5 }} disablePadding>
          <SettingsOutlined />
          <Typography variant="h3" sx={{ pl: 1 }}>
            Settings
          </Typography>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={() => dispatch(setMode())}>
            <ListItemIcon>
              {theme.palette.isDark ? <DarkModeOutlined /> : <LightModeOutlined />}
            </ListItemIcon>
            <ListItemText
              primary={'Theme Mode'}
              secondary={theme.palette.isDark ? 'Dark' : 'Light'}
            />
          </ListItemButton>
        </ListItem>

        <Divider />

        <ListItem disablePadding>
          <ThemeGenerator isSidebar />
        </ListItem>

        <Divider />

        <ListItem disablePadding>{encKeyTextInput}</ListItem>

        <Divider />
      </List>
    </Box>
  );

  return (
    <React.Fragment>
      <IconButton onClick={toggleDrawer}>
        <SettingsOutlined />
      </IconButton>

      <Drawer anchor="right" open={isDrawerVisible} onClose={() => setDrawerVisible(false)}>
        {drawerItems()}
      </Drawer>
    </React.Fragment>
  );
};

export default SettingsDrawerButton;
