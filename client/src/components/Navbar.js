import React, { useState } from 'react'
import {
  LightModeOutlined, DarkModeOutlined, Menu as MenuIcon,
  Search, SettingsOutlined, ArrowDropDownOutlined
} from '@mui/icons-material'
import FlexBetween from 'components/FlexBetween'

import { useDispatch } from 'react-redux'
import { setMode } from 'state'
import { AppBar, Box, Button, IconButton, InputBase, Menu, MenuItem, Toolbar, Typography, useTheme } from '@mui/material'

const profileImage = 'https://images.unsplash.com/photo-1676563557415-750119f928e7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3540&q=80'

function Navbar( {
  user,
  isSidebarOpen,
  setIsSidebarOpen,
} ) {
  const dispatch = useDispatch()
  const theme = useTheme()

  const [ anchorEl, setAnchorEl ] = useState( null )
  const isOpen = Boolean( anchorEl )
  const handleUserProfileClick = ( event ) => setAnchorEl( event.currentTarget )
  const handleUserProfileClose = () => setAnchorEl( null )

  return (
    <AppBar
      sx={{
        position: 'static',
        background: 'none',
        boxShadow: 'none',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>

        {/* Left Side */}
        <FlexBetween>
          <IconButton onClick={() => setIsSidebarOpen( !isSidebarOpen )}><MenuIcon /></IconButton>
          <FlexBetween
            bgcolor={theme.palette.background.alt}
            borderRadius='9px'
            gap='3rem'
            p='0.1rem 1.5rem'
          >
            <InputBase placeholder='Search...' />
            <IconButton><Search /></IconButton>
          </FlexBetween>
        </FlexBetween>

        {/* Right Side */}

        <FlexBetween gap='1.5rem'>
          <IconButton onClick={() => dispatch( setMode() )}>
            {theme.palette.mode === 'dark' ? (
              <DarkModeOutlined sx={{ fontSize: '25px' }} />
            ) : (
              <LightModeOutlined sx={{ fontSize: '25px' }} />
            )}
          </IconButton>
          <IconButton>
            <SettingsOutlined />
          </IconButton>

          <FlexBetween>
            <Button onClick={handleUserProfileClick}
              sx={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', textTransform: 'none', gap: '1rem',
              }}
            >
              <Box
                component='img'
                alt='profile'
                src={profileImage}
                height='40px'
                width='40px'
                borderRadius='50%'
                sx={{ objectFit: 'cover' }}
              />
              <Box textAlign='left'>
                <Typography fontWeight='bold' fontSize='0.8rem' sx={{ color: theme.palette.secondary[ 100 ] }}>
                  {user.name}
                </Typography>
                <Typography fontSize='0.7rem' sx={{ color: theme.palette.secondary[ 200 ] }}>
                  {user.occupation}
                </Typography>
              </Box>
              <ArrowDropDownOutlined
                sx={{ color: theme.palette.secondary[ 300 ], fontSize: '25px' }}
              />
            </Button>
            <Menu anchorEl={anchorEl} open={isOpen} onClose={handleUserProfileClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
              <MenuItem onClick={handleUserProfileClose}>Logout</MenuItem>
            </Menu>
          </FlexBetween>

        </FlexBetween>

      </Toolbar>
    </AppBar>
  )
}

export default Navbar