/**
 * Typography used in theme
 * @param {JsonObject} theme theme customization object
 */

export default function themeTypography(theme, palette) {
  return {
    fontFamily: theme.customization.fontFamily,
    // fontSize: "1rem",
    h6: {
      color: palette.text.heading,
      fontWeight: 600,
      fontSize: "1rem",
      lineHeight: "1.2rem",
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.125rem",
      lineHeight: "1.6rem",
      color: palette.text.heading,
    },
    h4: {
      color: palette.text.heading,
      fontWeight: 600,
      fontSize: "1.3125rem",
      lineHeight: "1.6rem",
    },
    h3: {
      color: palette.text.heading,
      fontWeight: 600,
      fontSize: "1.5rem",
      lineHeight: "1.75rem",
      fontFamily: theme.customization.fontFamily,
    },
    h2: {
      color: palette.text.heading,
      fontWeight: 600,
      fontSize: "1.875rem",
      lineHeight: "2.25rem",
      fontFamily: theme.customization.fontFamily,
    },
    h1: {
      color: palette.text.heading,
      fontWeight: 600,
      fontSize: "2.25rem",
      lineHeight: "2.75rem",
      fontFamily: theme.customization.fontFamily,
    },
    subtitle1: {
      color: palette.text.primary,
      fontSize: "0.875rem",
      fontWeight: 400,
    },
    subtitle2: {
      color: palette.text.secondary,
      fontSize: "0.875rem",
      fontWeight: 400,
    },
    caption: {
      fontSize: "0.75rem",
      color: palette.text.secondary,
      fontWeight: 400,
    },
    body1: {
      fontSize: "0.875rem",
      fontWeight: 400,
      lineHeight: "1.334em",
      color: palette.text.primary,
    },
    body2: {
      letterSpacing: "0em",
      fontWeight: 400,
      lineHeight: "1.5em",
      color: palette.text.secondary,
    },
    button: {
      textTransform: "capitalize",
      color: palette.text.primary,
    },
    customInput: {
      marginTop: 1,
      marginBottom: 1,
      "& > label": {
        top: 23,
        left: 0,
        color: palette.grey[500],
        '&[data-shrink="false"]': {
          top: 5,
        },
      },
      "& > div > input": {
        padding: "30.5px 14px 11.5px !important",
      },
      "& legend": {
        display: "none",
      },
      "& fieldset": {
        top: 0,
      },
    },
    mainContent: {
      backgroundColor: palette.background.default,
      width: "100%",
      minHeight: "calc(100vh - 88px)",
      flexGrow: 1,
      padding: "20px",
      marginTop: "88px",
      marginRight: "20px",
      borderRadius: `${theme.customization.borderRadius}px`,
    },
    menuCaption: {
      fontSize: "0.875rem",
      fontWeight: 500,
      color: palette.text.heading,
      padding: "6px",
      textTransform: "capitalize",
      marginTop: "10px",
    },
    subMenuCaption: {
      fontSize: "0.6875rem",
      fontWeight: 500,
      color: palette.text.secondary,
      textTransform: "capitalize",
    },
    commonAvatar: {
      cursor: "pointer",
      borderRadius: "8px",
    },
    smallAvatar: {
      width: "22px",
      height: "22px",
      fontSize: "1rem",
    },
    mediumAvatar: {
      width: "34px",
      height: "34px",
      fontSize: "1.2rem",
    },
    largeAvatar: {
      width: "44px",
      height: "44px",
      fontSize: "1.5rem",
    },
  };
}
