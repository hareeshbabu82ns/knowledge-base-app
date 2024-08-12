import { CssBaseline, ThemeProvider } from '@mui/material';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { BrowserRouter, useRoutes } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';

import customTheme from 'themes';
import Router from 'routes/Router';

function App() {
  const themeState = useSelector((state) => state.theme);
  const theme = useMemo(
    () =>
      customTheme({
        mode: themeState.mode,
        baseColor: themeState.baseColor,
        secondaryColor: themeState.secondaryColor,
        tertiaryColor: themeState.tertiaryColor,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }),
    [themeState],
  );

  return (
    <div className="app" style={{ display: 'flex' }}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AppRoutes />
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export const AppRoutes = () => {
  const routing = useRoutes(Router);
  return <LocalizationProvider dateAdapter={AdapterLuxon}>{routing}</LocalizationProvider>;
};

export default App;
