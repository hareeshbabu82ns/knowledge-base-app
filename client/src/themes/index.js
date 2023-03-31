import { createTheme } from "@mui/material/styles";
import tinycolor from "tinycolor2";

// assets
// import cssCustomColors from "assets/scss/_themes-vars.module.scss";

// project imports
import componentStyleOverrides from "./compStyleOverride";
import themePalette from "./dynamic-palette";
import materialDynamicColors from "./material-dynamic-colors";
import themeTypography from "./typography";

// function that reverses the color palette
function reverseTokens(tokensDark) {
  const reversedTokens = {};
  Object.entries(tokensDark).forEach(([key, val]) => {
    const keys = Object.keys(val);
    const values = Object.values(val);
    const length = keys.length;
    const reversedObj = {};
    for (let i = 0; i < length; i++) {
      reversedObj[keys[i]] = values[length - i - 1];
    }
    reversedTokens[key] = reversedObj;
  });
  return reversedTokens;
}

/**
 * Represent theme style and structure as per Material-UI
 * @param {JsonObject} customization customization parameter object
 */

// const baseColor = "#130019";

export const theme = (customization) => {
  const isDark = customization?.mode === "dark";

  const baseColor = customization?.baseColor || "#130019";

  const dynColors = materialDynamicColors(baseColor);

  const colors = {
    // ...(isDark ? colorsDark : colorsLight),
    ...dynColors[customization?.mode],
  };

  const tetradColors = tinycolor(baseColor).tetrad();
  colors.primary = tetradColors[0].toString();
  colors.secondary = tetradColors[1].toString();
  colors.tertiary = tetradColors[2].toString();

  // colors.primary = tinycolor.random().toString();
  // colors.secondary = tinycolor.random().toString();
  // colors.tertiary = tinycolor.random().toString();

  // const {h,s,v} = tinycolor(baseColor).toHsv()
  console.log("baseColor: ", tinycolor(baseColor).toHsvString());
  console.log("primary: ", tinycolor(colors.primary).toHsvString());
  console.log("secondary: ", tinycolor(colors.secondary).toHsvString());
  console.log("tertiary: ", tinycolor(colors.tertiary).toHsvString());
  console.log("error: ", tinycolor(colors.error).toHsvString());

  const themeOption = {
    colors,
    // heading: colors.grey[isDark ? 900 : 100],
    // paper: colors.paper,
    // backgroundDefault: colors.background,
    // background: colors.primaryLight,
    // darkTextPrimary: colors.textPrimary,
    // darkTextSecondary: colors.textSecondary,
    // textDark: colors.grey[isDark ? 50 : 900],
    // menuSelected: colors.secondaryDark,
    // menuSelectedBack: colors.secondaryLight,
    // divider: colors.grey[isDark ? 50 : 800],
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
