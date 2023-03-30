import React, { useState } from "react";
import {
  LightModeOutlined,
  DarkModeOutlined,
  Menu as MenuIcon,
  Search,
  SettingsOutlined,
  ArrowDropDownOutlined,
  ExitToAppOutlined,
} from "@mui/icons-material";
import FlexBetween from "components/FlexBetween";

import { useDispatch } from "react-redux";
import { setMode } from "state";
import {
  alpha,
  AppBar,
  Box,
  Button,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  styled,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import { clearUserLocal } from "scenes/user/utils";
import { useNavigate } from "react-router-dom";

const profileImage =
  "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgaWQ9IlNWR1JlcG9fYmdDYXJyaWVyIiBzdHJva2Utd2lkdGg9IjAiPjwvZz48ZyBpZD0iU1ZHUmVwb190cmFjZXJDYXJyaWVyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjwvZz48ZyBpZD0iU1ZHUmVwb19pY29uQ2FycmllciI+IDxwYXRoIGQ9Ik0xMi4xMiAxMi43OEMxMi4wNSAxMi43NyAxMS45NiAxMi43NyAxMS44OCAxMi43OEMxMC4xMiAxMi43MiA4LjcxOTk3IDExLjI4IDguNzE5OTcgOS41MDk5OEM4LjcxOTk3IDcuNjk5OTggMTAuMTggNi4yMjk5OCAxMiA2LjIyOTk4QzEzLjgxIDYuMjI5OTggMTUuMjggNy42OTk5OCAxNS4yOCA5LjUwOTk4QzE1LjI3IDExLjI4IDEzLjg4IDEyLjcyIDEyLjEyIDEyLjc4WiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+IDxwYXRoIGQ9Ik0xOC43NCAxOS4zODAxQzE2Ljk2IDIxLjAxMDEgMTQuNiAyMi4wMDAxIDEyIDIyLjAwMDFDOS40MDAwMSAyMi4wMDAxIDcuMDQwMDEgMjEuMDEwMSA1LjI2MDAxIDE5LjM4MDFDNS4zNjAwMSAxOC40NDAxIDUuOTYwMDEgMTcuNTIwMSA3LjAzMDAxIDE2LjgwMDFDOS43NzAwMSAxNC45ODAxIDE0LjI1IDE0Ljk4MDEgMTYuOTcgMTYuODAwMUMxOC4wNCAxNy41MjAxIDE4LjY0IDE4LjQ0MDEgMTguNzQgMTkuMzgwMVoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PC9wYXRoPiA8cGF0aCBkPSJNMTIgMjJDMTcuNTIyOCAyMiAyMiAxNy41MjI4IDIyIDEyQzIyIDYuNDc3MTUgMTcuNTIyOCAyIDEyIDJDNi40NzcxNSAyIDIgNi40NzcxNSAyIDEyQzIgMTcuNTIyOCA2LjQ3NzE1IDIyIDEyIDIyWiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48L3BhdGg+IDwvZz48L3N2Zz4=";

const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "right",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "right",
    }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 0,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color: theme.palette.grey[700],
    // theme.palette.mode === "light"
    //   ? theme.palette.grey[700]
    //   : theme.palette.grey[300],
    backgroundColor: "red",
    // backgroundColor: theme.palette.background.alt,
    boxShadow:
      "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
    "& .MuiMenu-list": {
      padding: "4px 0",
    },
    "& .MuiMenuItem-root": {
      "& .MuiSvgIcon-root": {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      "&:active": {
        backgroundColor: "red",
        // backgroundColor: alpha(
        //   theme.palette.primary.main,
        //   theme.palette.action.selectedOpacity
        // ),
      },
    },
  },
}));

function Navbar({ user, isSidebarOpen, setIsSidebarOpen }) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const isOpen = Boolean(anchorEl);
  const handleUserProfileClick = (event) => setAnchorEl(event.currentTarget);
  const handleUserProfileClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleUserProfileClose();
    clearUserLocal();
    navigate("/signin");
  };

  return (
    <AppBar
      sx={{
        position: "static",
        background: "none",
        boxShadow: "none",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Left Side */}
        <FlexBetween>
          <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <MenuIcon />
          </IconButton>
          <FlexBetween
            bgcolor={theme.palette.background.alt}
            borderRadius="9px"
            gap="3rem"
            p="0.1rem 1.5rem"
          >
            <InputBase placeholder="Search..." />
            <IconButton>
              <Search />
            </IconButton>
          </FlexBetween>
        </FlexBetween>

        {/* Right Side */}

        <FlexBetween gap="1.5rem">
          <IconButton onClick={() => dispatch(setMode())}>
            {theme.palette.mode === "dark" ? (
              <DarkModeOutlined sx={{ fontSize: "25px" }} />
            ) : (
              <LightModeOutlined sx={{ fontSize: "25px" }} />
            )}
          </IconButton>
          <IconButton>
            <SettingsOutlined />
          </IconButton>

          <FlexBetween>
            <Button
              onClick={handleUserProfileClick}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                textTransform: "none",
                gap: "1rem",
              }}
            >
              <Box
                component="img"
                alt="profile"
                src={user?.profilePic || profileImage}
                height="40px"
                width="40px"
                borderRadius="50%"
                sx={{ objectFit: "cover" }}
              />
              <Box textAlign="left">
                <Typography fontWeight="bold" fontSize="0.8rem">
                  {user.name}
                </Typography>
                <Typography fontSize="0.7rem">{user.occupation}</Typography>
              </Box>
              <ArrowDropDownOutlined
                sx={{ color: theme.palette.secondary[900], fontSize: "25px" }}
              />
            </Button>
            <StyledMenu
              anchorEl={anchorEl}
              open={isOpen}
              onClose={handleUserProfileClose}
            >
              <MenuItem onClick={handleLogout}>
                <ExitToAppOutlined />
                Logout
              </MenuItem>
            </StyledMenu>
          </FlexBetween>
        </FlexBetween>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
