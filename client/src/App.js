import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";

// import { themeSettings } from "theme";
import customTheme from "themes";
import Dashboard from "scenes/dashboard";
import ProtectedLayout from "scenes/layout";
import Products from "scenes/products";
import Customers from "scenes/customers";
import Transactions from "scenes/transactions";
import Geography from "scenes/geography";
// import Overview from "scenes/overview";
import ExpenseStats from "scenes/dashboard/ExpenseStats";
import Daily from "scenes/daily";
import Monthly from "scenes/monthly";
import Breakdown from "scenes/breakdown";
import Admin from "scenes/admin";
import Performance from "scenes/performance";
import Login from "scenes/user/Login";
import Signup from "scenes/user/Signup";
import Expenses from "scenes/expenses";

function App() {
  const mode = useSelector((state) => state.global.mode);
  const baseColor = useSelector((state) => state.global.baseColor);
  const theme = useMemo(
    () => customTheme({ mode, baseColor }),
    [mode, baseColor]
  );
  // const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

  return (
    <div className="app" style={{ display: "flex" }}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <Routes>
              <Route element={<ProtectedLayout />}>
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/products" element={<Products />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/geography" element={<Geography />} />
                <Route path="/overview" element={<ExpenseStats />} />
                {/* <Route path="/overview" element={<Overview />} /> */}
                <Route path="/daily" element={<Daily />} />
                <Route path="/monthly" element={<Monthly />} />
                <Route path="/breakdown" element={<Breakdown />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/performance" element={<Performance />} />
              </Route>
              <Route path="/signin" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Routes>
          </LocalizationProvider>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
