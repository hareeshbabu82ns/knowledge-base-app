/**
 * Color intention that you want to used in your theme
 * @param {JsonObject} theme Theme customization object
 */

export default function themePalette(theme) {
  const isDark = theme.customization?.mode === "dark";

  return {
    mode: theme?.customization?.mode,
    primary: {
      main: theme.colors["primaryMain"],
      contrastText: "#fff",
    },
    secondary: {
      main: theme.colors["secondaryMain"],
      contrastText: "#000",
    },
    // teriary: {
    //   main: theme.colors["teriaryMain"],
    // },
    // neutral: {
    //   main: theme.colors["neutralMain"],
    // },
    background: {
      default: theme.colors.primary[isDark ? 800 : 50],
      alt: theme.colors.primary[isDark ? 500 : 200],
    },
    error: {
      main: theme.colors["errorMain"],
    },
    // grey,
  };
}
