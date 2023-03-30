import { darken, lighten } from "@mui/material";
// import { toneByMode } from "./utils";

export default function componentStyleOverrides(theme, palette) {
  const isDark = theme.customization.mode === "dark";

  const bgColor = isDark
    ? darken(palette.primary[500], 0.7)
    : lighten(palette.primary[500], 0.9);
  // const bgColor = toneByMode(palette.primary[500], isDark, {
  //   darkBy: 0.8,
  //   lightBy: 0.9,
  // });
  // const bgColor = isDark ? palette?.grey[100] : palette?.grey[600];

  return {
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: "4px",
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        rounded: {
          borderRadius: `${theme.customization.borderRadius}px`,
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          color: palette.text.primary,
          padding: "24px",
        },
        title: {
          fontSize: "1.125rem",
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "24px",
        },
      },
    },
    MuiCardActions: {
      styleOverrides: {
        root: {
          padding: "24px",
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          color: palette.text.primary,
          paddingTop: "10px",
          paddingBottom: "10px",
          "&.Mui-selected": {
            color: palette.warning[200],
            backgroundColor: palette.secondary[200],
            "&:hover": {
              color: palette.warning[200],
              backgroundColor: palette.secondary[300],
            },
            "& .MuiListItemIcon-root": {
              color: palette.warning[200],
            },
          },
          "&:hover": {
            backgroundColor: palette.secondary[100],
            color: palette.secondary[200],
            "& .MuiListItemIcon-root": {
              color: palette.warning[200],
            },
          },
          "& .MuiListItemIcon-root": {
            color: palette.secondary[900],
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: palette.text.primary,
          minWidth: "36px",
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: palette.grey[900],
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          color: palette.grey[900],
          "&::placeholder": {
            color: palette.grey[900],
            fontSize: "0.875rem",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          background: bgColor,
          borderRadius: `${theme.customization.borderRadius}px`,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: palette.grey[400],
          },
          "&:hover $notchedOutline": {
            borderColor: palette.primary[700],
          },
          "&.MuiInputBase-multiline": {
            padding: 1,
          },
        },
        input: {
          fontWeight: 500,
          background: bgColor,
          padding: "15.5px 14px",
          borderRadius: `${theme.customization.borderRadius}px`,
          "&.MuiInputBase-inputSizeSmall": {
            padding: "10px 14px",
            "&.MuiInputBase-inputAdornedStart": {
              paddingLeft: 0,
            },
          },
        },
        inputAdornedStart: {
          paddingLeft: 4,
        },
        notchedOutline: {
          borderRadius: `${theme.customization.borderRadius}px`,
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          "&.Mui-disabled": {
            color: palette.grey[300],
          },
        },
        mark: {
          backgroundColor: palette.background.paper,
          width: "4px",
        },
        valueLabel: {
          color: theme.colors.primary[800],
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: palette.grey[300],
          opacity: 1,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          color: palette.primary[200],
          background: palette.primary[500],
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          "&.MuiChip-deletable .MuiChip-deleteIcon": {
            color: "inherit",
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          color: palette.background.paper,
          background: palette.grey[700],
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          "& .MuiToolbar-root > *": {
            color: palette.secondary[900],
          },
        },
        virtualScroller: {
          background: palette.primary[300],
        },
        footerContainer: {
          color: palette.secondary[800],
          // background: isDark
          //   ? palette.primary[300]
          //   : theme.colors.primary[800],
        },
        columnHeaders: {
          color: palette.secondary[900],
          background: isDark ? palette.colors.background : palette.primary[200],
        },
      },
    },
  };
}
