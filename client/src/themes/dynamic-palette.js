import {
  indigo as primary,
  teal as secondary,
  grey,
  green as success,
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

const preparePalette = (isDark, colors) => {
  const primaryPalette = paletteGen({ hex: colors.primary, isDark });
  const secondaryPalette = paletteGen({ hex: colors.secondary, isDark });
  const tertiaryPalette = paletteGen({ hex: colors.tertiary, isDark });

  return {
    colors,
    primary: primaryPalette,
    secondary: secondaryPalette,
    tertiary: tertiaryPalette,
    success,
    warning,
    error: paletteGen({ hex: colors.error, isDark }),
    grey: isDark ? GREY_DARK : grey,
    background: {
      default: toneByMode(secondaryPalette[900], isDark, {
        darkBy: 0.75,
        lightBy: 0.95,
      }),
      paper: toneByMode(secondaryPalette[600], isDark, {
        darkBy: 0.75,
        lightBy: 0.95,
      }),
      alt: toneByMode(secondaryPalette[500], isDark, {
        darkBy: 0.6,
        lightBy: 0.9,
      }),
      tile: toneByMode(secondaryPalette[500], isDark, {
        darkBy: 0.7,
        lightBy: 0.9,
      }),
      // default: colors.background,
      // paper: colors.surface,
      // alt: colors.surfaceVariant,
    },
    divider: isDark ? GREY_DARK[200] : grey[200],
    text: {
      primary: toneByMode(colors.primary, !isDark, {
        darkBy: 0.4,
        lightBy: 0.4,
      }),
      secondary: toneByMode(colors.secondary, !isDark, {
        darkBy: 0.4,
        lightBy: 0.4,
      }),
      heading: toneByMode(colors.tertiary, !isDark, {
        darkBy: 0.4,
        lightBy: 0.4,
      }),
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
