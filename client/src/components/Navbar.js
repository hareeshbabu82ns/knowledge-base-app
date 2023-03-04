import React from 'react'
import {
  LightModeOutlined, DarkModeOutlined, Menu as MenuIcon,
  Search, SettingsOutlined, ArrowDropDownOutlined
} from '@mui/icons-material'
import FlexBetween from 'components/FlexBetween'

import { useDispatch } from 'react-redux'
import { setMode } from 'state'
import { AppBar, IconButton, InputBase, Toolbar, useTheme } from '@mui/material'

// https://images.unsplash.com/photo-1676563557415-750119f928e7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3540&q=80
function Navbar( {
  isSidebarOpen,
  setIsSidebarOpen,
} ) {
  const dispatch = useDispatch()
  const theme = useTheme()
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
        </FlexBetween>

      </Toolbar>
    </AppBar>
  )
}

export default Navbar