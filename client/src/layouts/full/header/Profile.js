import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Menu,
  Button,
  IconButton,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';

// import { IconListCheck, IconMail, IconUser } from '@tabler/icons';
import { Menu as IconListCheck, Menu as IconMail, Menu as IconUser } from '@mui/icons-material';

import ProfileImg from 'assets/images/profile/user-1.jpg';
import { useSelector } from 'react-redux';
import { clearUserLocal } from 'scenes/user/utils';

const Profile = () => {
  const user = useSelector((state) => state.global.user);
  // console.log('user:', user);
  const navigate = useNavigate();

  const [anchorEl2, setAnchorEl2] = useState(null);
  const handleClick2 = (event) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const handleLogout = () => {
    clearUserLocal();
    navigate('/auth/login');
  };

  return (
    <Box>
      <IconButton
        size="large"
        aria-label="show 11 new notifications"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          ...(typeof anchorEl2 === 'object' && {
            color: 'primary.main',
          }),
        }}
        onClick={handleClick2}
      >
        <Box
          component="img"
          alt="profile"
          src={user?.profilePic || ProfileImg}
          height="40px"
          width="40px"
          borderRadius="50%"
          sx={{ objectFit: 'cover' }}
        />
        <Box textAlign="left" borderLeft={5}>
          <Typography fontWeight="bold" fontSize="1rem">
            {user.name}
          </Typography>
          <Typography fontSize="0.7rem">{user.occupation}</Typography>
        </Box>
      </IconButton>
      {/* ------------------------------------------- */}
      {/* Message Dropdown */}
      {/* ------------------------------------------- */}
      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        sx={{
          '& .MuiMenu-paper': {
            width: '200px',
          },
        }}
      >
        <MenuItem>
          <ListItemIcon>
            <IconUser width={20} />
          </ListItemIcon>
          <ListItemText>My Profile</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <IconMail width={20} />
          </ListItemIcon>
          <ListItemText>My Account</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <IconListCheck width={20} />
          </ListItemIcon>
          <ListItemText>My Tasks</ListItemText>
        </MenuItem>
        <Box mt={1} py={1} px={2}>
          <Button variant="outlined" color="primary" fullWidth onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Profile;
