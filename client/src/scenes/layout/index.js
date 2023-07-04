import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, styled, useMediaQuery } from '@mui/material';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import Navbar from 'components/Navbar';
import Sidebar from 'components/Sidebar';

import { useGetUserQuery } from 'state/api';

const drawerWidth = '250px';

const Main = styled('main', {
  shouldForwardProp: (prop) => !['open', 'isNonMobile'].includes(prop),
})(({ theme, open, isNonMobile }) => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  // padding: theme.spacing(isNonMobile ? 3 : 1),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: isNonMobile ? `-${drawerWidth}` : '0px',
  ...(isNonMobile &&
    open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
}));

function ProtectedLayout() {
  const isNonMobile = useMediaQuery('(min-width: 600px)');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const location = useLocation();

  // const userId = useSelector( state => state.global.userId )
  const user = useSelector((state) => state.global.user);

  const { data } = useGetUserQuery(user?._id);
  // console.log( "🚀 ~ file: index.js:17 ~ Layout ~ data:", data )
  if (!user) {
    return <Navigate to={`/auth/login?from=${location.pathname}`} />;
  }

  return (
    <Box display="flex" flexGrow={1}>
      <Sidebar
        user={data || {}}
        isNonMobile={isNonMobile}
        drawerWidth={drawerWidth}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <Main open={isSidebarOpen} isNonMobile={isNonMobile}>
        <Navbar
          user={data || {}}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <Outlet />
      </Main>
    </Box>
  );
}

export default ProtectedLayout;
