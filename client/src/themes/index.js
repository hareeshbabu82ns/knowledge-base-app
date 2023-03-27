import { createTheme } from "@mui/material/styles";
// import { red } from "@mui/material/colors";

// assets
// import cssCustomColors from "assets/scss/_themes-vars.module.scss";
import cssPaletteColors from "assets/scss/_tokens.module.scss";
import cssTokenPaletteColors from "assets/scss/_tokens.colors.scss";
import cssColorsLight from "assets/scss/theme.dark.scss";
import cssColorsDark from "assets/scss/theme.dark.scss";

// project imports
import componentStyleOverrides from "./compStyleOverride";
import themePalette from "./palette";
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

const parsePalette = ({ paletteTokens, prefix, separator = "-" }) => {
  const palette = Object.keys(paletteTokens)
    .filter((k) => k.startsWith(prefix))
    .reduce((p, k) => {
      return {
        ...p,
        [k.split(separator)[1]]: paletteTokens[k],
      };
    }, {});
  return palette;
};

/**
 * Represent theme style and structure as per Material-UI
 * @param {JsonObject} customization customization parameter object
 */

export const theme = (customization) => {
  // const customColors = cssCustomColors;
  const tokenPaletteColors = cssTokenPaletteColors;
  const cssColors = cssPaletteColors;
  const colorsLight = cssColorsLight;
  const colorsDark = cssColorsDark;

  const isDark = customization?.mode === "dark";

  // prepare color arrays
  // console.log(tokenPaletteColors);
  const tokenPaletteColorsDark = {
    primary: parsePalette({
      paletteTokens: tokenPaletteColors,
      prefix: "primary",
    }),
    secondary: parsePalette({
      paletteTokens: tokenPaletteColors,
      prefix: "secondary",
    }),
    grey: parsePalette({
      paletteTokens: tokenPaletteColors,
      prefix: "grey",
    }),
  };
  // prepare light colors
  // const tokenPaletteColorsLight = reverseTokens(tokenPaletteColorsDark);

  const colors = {
    ...(isDark ? colorsDark : colorsLight),
    ...cssColors,
    // ...(isDark ? tokenPaletteColorsDark : tokenPaletteColorsLight),
    ...tokenPaletteColorsDark, // do not switch
    // ...customColors,
  };

  const themeOption = {
    colors,
    heading: colors.grey[isDark ? 900 : 100],
    paper: colors.paper,
    backgroundDefault: colors.background,
    background: colors.primaryLight,
    darkTextPrimary: colors.textPrimary,
    darkTextSecondary: colors.textSecondary,
    textDark: colors.grey[isDark ? 50 : 900],
    menuSelected: colors.secondaryDark,
    menuSelectedBack: colors.secondaryLight,
    divider: colors.grey[isDark ? 50 : 800],
    customization,
  };

  // console.log(themeOption);

  const themeOptions = {
    direction: "ltr",
    palette: themePalette(themeOption),
    mixins: {
      toolbar: {
        minHeight: "48px",
        padding: "16px",
        "@media (min-width: 600px)": {
          minHeight: "48px",
        },
      },
    },
    typography: themeTypography(themeOption),
  };

  const themes = createTheme(themeOptions);

  themes.components = componentStyleOverrides(themeOption);

  return themes;
};

export default theme;
