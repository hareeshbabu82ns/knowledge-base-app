import { darken, lighten } from "@mui/material";
import tinycolor from "tinycolor2";
import {
  lightBlue as primary,
  teal as secondary,
  lightGreen as tertiary,
  grey,
  green as success,
  blue as info,
  amber as warning,
  red as error,
} from "@mui/material/colors";

import paletteGen from "./generate-material-palette";
import { reverseColorPalette, toneByMode } from "./utils";

const GREY_DARK = reverseColorPalette({
  colorPalette: grey,
  mode: "dark",
  by: 0.1,
});
const SUCCESS_DARK = reverseColorPalette({
  colorPalette: success,
  mode: "dark",
  by: 0.1,
});
const INFO_DARK = reverseColorPalette({
  colorPalette: info,
  mode: "dark",
  by: 0.1,
});
const WARNING_DARK = reverseColorPalette({
  colorPalette: warning,
  mode: "dark",
  by: 0.1,
});
const ERROR_DARK = reverseColorPalette({
  colorPalette: error,
  mode: "dark",
  by: 0.1,
});

const prepareOnBackgroundColors = (palette) => {
  ["primary", "secondary", "tertiary"].forEach((paletteKey) => {
    const paletteColors = Object.values(palette[paletteKey]);
    // loop over each background color to find optimal readable text color
    Object.keys(palette.background).forEach((bgKey) => {
      const textKey = `on${bgKey.charAt(0).toUpperCase() + bgKey.substring(1)}${
        paletteKey.charAt(0).toUpperCase() + paletteKey.substring(1)
      }`;
      palette.text[textKey] = tinycolor
        .mostReadable(palette.background[bgKey], paletteColors, {
          includeFallbackColors: true,
        })
        .toHexString();
    });
  });
};

const preparePalette = (isDark, colors) => {
  // const primaryPalette = primary;
  // const secondaryPalette = secondary;
  // const tertiaryPalette = tertiary;
  const primaryPalette = paletteGen({ hex: colors.primary, isDark });
  const secondaryPalette = paletteGen({ hex: colors.secondary, isDark });
  const tertiaryPalette = paletteGen({ hex: colors.tertiary, isDark });

  const res = {
    colors,
    primary: primaryPalette,
    secondary: secondaryPalette,
    tertiary: tertiaryPalette,
    success: isDark ? SUCCESS_DARK : success,
    info: isDark ? INFO_DARK : info,
    warning: isDark ? WARNING_DARK : warning,
    error: isDark ? ERROR_DARK : error,
    // error: paletteGen({ hex: colors.error, isDark }),
    grey: isDark ? GREY_DARK : grey,
    background: {
      default: isDark
        ? darken(colors.primary, 0.75)
        : lighten(colors.primary, 0.9),
      paper: isDark
        ? darken(colors.primary, 0.75)
        : lighten(colors.primary, 0.9),
      alt: isDark ? darken(colors.primary, 0.6) : lighten(colors.primary, 0.7),
      tile: isDark
        ? darken(colors.primary, 0.65)
        : lighten(colors.primary, 0.75),
      // default: colors.background,
      // paper: colors.surface,
      // alt: colors.surfaceVariant,
    },
    divider: isDark ? GREY_DARK[200] : grey[200],
    text: {
      primary: isDark ? "#fff" : "#000",
      secondary: isDark ? "#fff" : "#000",
      heading: isDark ? "#fff" : "#000",
      // primary: primaryPalette["A700"],
      // secondary: secondaryPalette["A700"],
      // heading: tertiaryPalette["A700"],
    },
  };
  prepareOnBackgroundColors(res);
  return res;
};

export default function themePalette(theme) {
  const isDark = theme.customization?.mode === "dark";

  return {
    mode: theme?.customization?.mode,
    isDark,
    ...preparePalette(isDark, theme.colors),
  };
}
