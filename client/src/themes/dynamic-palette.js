import { darken, lighten } from "@mui/material";
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
import tinycolor from "tinycolor2";

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

const preparePalette = (isDark, colors) => {
  // const primaryPalette = primary;
  // const secondaryPalette = secondary;
  // const tertiaryPalette = tertiary;
  const primaryPalette = paletteGen({ hex: colors.primary, isDark });
  const secondaryPalette = paletteGen({ hex: colors.secondary, isDark });
  const tertiaryPalette = paletteGen({ hex: colors.tertiary, isDark });

  return {
    colors,
    primary: primaryPalette,
    secondary: secondaryPalette,
    tertiary: tertiaryPalette,
    success: isDark ? SUCCESS_DARK : success,
    info: isDark ? INFO_DARK : info,
    warning: isDark ? WARNING_DARK : warning,
    error: paletteGen({ hex: colors.error, isDark }),
    grey: isDark ? GREY_DARK : grey,
    background: {
      default: isDark
        ? darken(colors.secondary, 0.75)
        : lighten(colors.secondary, 0.9),
      paper: isDark
        ? darken(colors.secondary, 0.75)
        : lighten(colors.secondary, 0.9),
      alt: isDark
        ? darken(colors.secondary, 0.6)
        : lighten(colors.secondary, 0.7),
      tile: isDark
        ? darken(colors.secondary, 0.65)
        : lighten(colors.secondary, 0.75),
      // default: colors.background,
      // paper: colors.surface,
      // alt: colors.surfaceVariant,
    },
    divider: isDark ? GREY_DARK[200] : grey[200],
    text: {
      primary: primaryPalette["A700"],
      // primary: toneByMode(colors.primary, !isDark, {
      //   darkBy: 0.4,
      //   lightBy: 0.4,
      // }),
      secondary: secondaryPalette["A700"],
      // secondary: toneByMode(colors.secondary, !isDark, {
      //   darkBy: 0.4,
      //   lightBy: 0.4,
      // }),
      heading: tertiaryPalette["A700"],
      // heading: isDark
      //   ? lighten(colors.tertiary, 0.8)
      //   : darken(colors.tertiary, 0.6),
    },
  };
};

export default function themePalette(theme) {
  const isDark = theme.customization?.mode === "dark";

  return {
    mode: theme?.customization?.mode,
    ...preparePalette(isDark, theme.colors),
  };
}
