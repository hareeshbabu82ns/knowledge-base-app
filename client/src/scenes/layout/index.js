import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Box, useMediaQuery } from '@mui/material'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import Navbar from 'components/Navbar'
import Sidebar from 'components/Sidebar'

import { useGetUserQuery } from 'state/api'

function ProtectedLayout() {
  const isNonMobile = useMediaQuery( '(min-width: 600px)' )
  const [ isSidebarOpen, setIsSidebarOpen ] = useState( true )

  const location = useLocation()

  // const userId = useSelector( state => state.global.userId )
  const user = useSelector( state => state.global.user )

  const { data } = useGetUserQuery( user?._id )
  // console.log( "🚀 ~ file: index.js:17 ~ Layout ~ data:", data )
  if ( !user ) {
    return ( <Navigate to={`/signin?from=${location.pathname}`} /> )
  }

  return (
    <Box
      display={isNonMobile ? 'flex' : 'block'}
      width='100%' height='100%'>
      <Sidebar
        user={data || {}}
        isNonMobile={isNonMobile}
        drawerWidth='250px'
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <Box flexGrow={1}>
        <Navbar
          user={data || {}}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <Outlet />
      </Box>
    </Box>
  )
}

export default ProtectedLayout