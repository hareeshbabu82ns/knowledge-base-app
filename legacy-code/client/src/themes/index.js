import { createTheme } from "@mui/material/styles";

// assets
// import cssCustomColors from "assets/scss/_themes-vars.module.scss";

// project imports
import componentStyleOverrides from "./compStyleOverride";
import themePalette from "./dynamic-palette";
import materialDynamicColors from "./material-dynamic-colors";
import themeTypography from "./typography";

/**
 * Represent theme style and structure as per Material-UI
 * @param {JsonObject} customization customization parameter object
 */

export const theme = (customization) => {
  const isDark = customization.mode === "dark";

  const baseColor = customization.baseColor || "#130019";

  const colors = materialDynamicColors({
    seed: baseColor,
    isDark,
    overrides: {
      light: {
        primary: customization.baseColor,
        secondary: customization.secondaryColor,
        tertiary: customization.tertiaryColor,
      },
      dark: {
        primary: customization.baseColor,
        secondary: customization.secondaryColor,
        tertiary: customization.tertiaryColor,
      },
    },
  });
  // console.log(colors.primary);
  // console.log(colors.secondary);
  // console.log(colors.tertiary);
  const themeOption = {
    colors,
    customization,
  };

  // console.log(themeOption);

  const palette = themePalette(themeOption);

  // console.log(palette);

  const themeOptions = {
    direction: "ltr",
    palette,
    mixins: {
      toolbar: {
        minHeight: "48px",
        padding: "16px",
        "@media (min-width: 600px)": {
          minHeight: "48px",
        },
      },
    },
    typography: themeTypography(themeOption, palette),
  };

  const themes = createTheme(themeOptions);

  themes.components = componentStyleOverrides(themeOption, palette);

  return themes;
};

export default theme;
