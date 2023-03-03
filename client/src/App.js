import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ProSidebarProvider } from 'react-pro-sidebar';
import Topbar from './scenes/global/Topbar'
import Sidebar from './scenes/global/Sidebar'
import { Outlet } from "react-router-dom";


function App() {
  const [ theme, colorMode ] = useMode()

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ProSidebarProvider>
          <div className="app">
            <Sidebar />
            <main className="content">
              <Topbar />
              <Outlet />
            </main>
          </div>
        </ProSidebarProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
