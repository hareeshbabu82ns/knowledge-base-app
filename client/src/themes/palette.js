import {
  indigo as primary,
  teal as secondary,
  grey,
  green,
  amber,
  red,
} from "@mui/material/colors";
import { reverseColorPalette } from "./utils";

// function createGradient(color1, color2) {
//   return `linear-gradient(to bottom, ${color1}, ${color2})`
// }

const baseColor = "#130019";

const baseColorPalette = {
  main: baseColor,
  50: "#f2e6f3",
  100: "#e0c0e3",
  200: "#cc96d2",
  300: "#b76ebf",
  400: "#a850b1",
  500: "#9836a4",
  600: "#8b329e",
  700: "#7a2c95",
  800: "#6a278c",
  900: "#4e1e7e",
  A100: baseColor,
  A200: baseColor,
  A400: baseColor,
  A700: baseColor,
};

const PRIMARY = {
  ...primary,
  main: primary[500],
  contrastText: "#fff",
};
// const PRIMARY = {
//   ...blue,
//   main: blue[ 500 ],
//   contrastText: '#fff'
// }
const SECONDARY = {
  ...secondary,
  main: secondary[500],
  contrastText: "#fff",
};
const GREY = {
  ...grey,
  main: grey[500],
  contrastText: "#fff",
};
const SUCCESS = {
  ...green,
  main: green[500],
  contrastText: "#fff",
};
const WARNING = {
  ...amber,
  main: amber[500],
  contrastText: "#fff",
};
const ERROR = {
  ...red,
  main: red[500],
  contrastText: "#fff",
};

const paletteLight = {
  primary: { ...PRIMARY },
  secondary: { ...SECONDARY },
  success: { ...SUCCESS },
  warning: { ...WARNING },
  error: { ...ERROR },
  divider: GREY[300],
  text: {
    primary: GREY[900],
    secondary: GREY[800],
    heading: GREY[900],
  },
  background: {
    default: PRIMARY[300],
    paper: PRIMARY[300],
    alt: PRIMARY[200],
  },
};

const GREY_DARK = reverseColorPalette({
  colorPalette: GREY,
  mode: "dark",
  by: 0.1,
});

const paletteDark = {
  primary: {
    ...reverseColorPalette({ colorPalette: PRIMARY, mode: "dark", by: 0.4 }),
  },
  secondary: {
    ...reverseColorPalette({ colorPalette: SECONDARY, mode: "dark", by: 0.3 }),
  },
  success: {
    ...reverseColorPalette({ colorPalette: SUCCESS, mode: "dark", by: 0.2 }),
  },
  warning: {
    ...reverseColorPalette({ colorPalette: WARNING, mode: "dark", by: 0.2 }),
  },
  error: {
    ...reverseColorPalette({ colorPalette: ERROR, mode: "dark", by: 0.2 }),
  },
  grey: { ...GREY_DARK },
  divider: GREY_DARK[200],
  text: {
    primary: GREY_DARK[900],
    secondary: GREY_DARK[800],
    heading: GREY_DARK[900],
  },
  background: {
    default: PRIMARY[900], //'#0A1929',//GREY_DARK[100],
    paper: PRIMARY[600], //'#0A1929',//GREY_DARK[100],
    alt: PRIMARY[700],
  },
};

export default function themePalette(theme) {
  const isDark = theme.customization?.mode === "dark";

  return {
    mode: theme?.customization?.mode,
    ...(isDark ? paletteDark : paletteLight),
  };
}

// /**
//  * Color intention that you want to used in your theme
//  * @param {JsonObject} theme Theme customization object
//  */

// export default function themePalette(theme) {
//   const isDark = theme.customization?.mode === "dark";

//   return {
//     mode: theme?.customization?.mode,
//     primary: {
//       main: theme.colors["primaryMain"],
//       contrastText: "#fff",
//     },
//     secondary: {
//       main: theme.colors["secondaryMain"],
//       contrastText: "#000",
//     },
//     // teriary: {
//     //   main: theme.colors["teriaryMain"],
//     // },
//     // neutral: {
//     //   main: theme.colors["neutralMain"],
//     // },
//     background: {
//       default: theme.colors.primary[isDark ? 800 : 50],
//       alt: theme.colors.primary[isDark ? 500 : 200],
//     },
//     error: {
//       main: theme.colors["errorMain"],
//     },
//     // grey,
//   };
// }
