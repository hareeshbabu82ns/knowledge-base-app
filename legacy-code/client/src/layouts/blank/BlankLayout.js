import { styled } from '@mui/material';
import { Outlet } from 'react-router-dom';

const MainWrapper = styled('div')(() => ({
  display: 'flex',
  minHeight: '100vh',
  width: '100%',
}));

const PageWrapper = styled('div')(() => ({
  display: 'flex',
  flexGrow: 1,
  paddingBottom: '60px',
  flexDirection: 'column',
  zIndex: 1,
  backgroundColor: 'transparent',
}));

const BlankLayout = () => (
  <MainWrapper className="mainwrapper">
    <PageWrapper className="page-wrapper">
      <Outlet />
    </PageWrapper>
  </MainWrapper>
);

export default BlankLayout;
