import { darken, lighten } from "@mui/material";

export const getBackgroundColor = (color, mode) =>
  mode === "dark" ? darken(color, 0.7) : lighten(color, 0.7);

export const getHoverBackgroundColor = (color, mode) =>
  mode === "dark" ? darken(color, 0.6) : lighten(color, 0.6);

export const getSelectedBackgroundColor = (color, mode) =>
  mode === "dark" ? darken(color, 0.5) : lighten(color, 0.5);

export const getSelectedHoverBackgroundColor = (color, mode) =>
  mode === "dark" ? darken(color, 0.4) : lighten(color, 0.4);

export const toneByMode = (color, toDark, { darkBy, lightBy }) => {
  const funcMode = toDark ? darken : lighten;
  return funcMode(color, toDark ? darkBy : lightBy);
};

export const reverseColorPalette = ({
  colorPalette,
  mode = "light",
  by = 0,
}) => {
  const funcMode = mode === "light" ? lighten : darken;

  const res = {
    ...colorPalette,
    main: funcMode(colorPalette["400"], by),
    50: funcMode(colorPalette["900"], by),
    100: funcMode(colorPalette["800"], by),
    200: funcMode(colorPalette["700"], by),
    300: funcMode(colorPalette["600"], by),
    400: funcMode(colorPalette["500"], by),
    500: funcMode(colorPalette["400"], by),
    600: funcMode(colorPalette["300"], by),
    700: funcMode(colorPalette["200"], by),
    800: funcMode(colorPalette["100"], by),
    900: funcMode(colorPalette["50"], by),
    A100: funcMode(colorPalette["A700"], by),
    A200: funcMode(colorPalette["A400"], by),
    A400: funcMode(colorPalette["A200"], by),
    A700: funcMode(colorPalette["A100"], by),
  };
  return res;
};

// export const hslToHex = (h, s, l) => {
//   l /= 100;
//   const a = (s * Math.min(l, 1 - l)) / 100;
//   const f = (n) => {
//     const k = (n + h / 30) % 12;
//     const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
//     return Math.round(255 * color)
//       .toString(16)
//       .padStart(2, "0"); // convert to Hex and prefix "0" if needed
//   };
//   return `#${f(0)}${f(8)}${f(4)}`;
// };

export const RGBToHex = (r, g, b) => {
  r = r.toString(16);
  g = g.toString(16);
  b = b.toString(16);

  if (r.length === 1) r = "0" + r;
  if (g.length === 1) g = "0" + g;
  if (b.length === 1) b = "0" + b;

  return "#" + r + g + b;
};

export const RGBAToHexA = (r, g, b, a) => {
  r = r.toString(16);
  g = g.toString(16);
  b = b.toString(16);
  a = Math.round(a * 255).toString(16);

  if (r.length === 1) r = "0" + r;
  if (g.length === 1) g = "0" + g;
  if (b.length === 1) b = "0" + b;
  if (a.length === 1) a = "0" + a;

  return "#" + r + g + b + a;
};

export const hexToHSL = (H) => {
  // Convert hex to RGB first
  let r = 0,
    g = 0,
    b = 0;
  if (H.length === 4) {
    r = "0x" + H[1] + H[1];
    g = "0x" + H[2] + H[2];
    b = "0x" + H[3] + H[3];
  } else if (H.length === 7) {
    r = "0x" + H[1] + H[2];
    g = "0x" + H[3] + H[4];
    b = "0x" + H[5] + H[6];
  }
  // Then to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  let cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin,
    h = 0,
    s = 0,
    l = 0;

  if (delta === 0) h = 0;
  else if (cmax === r) h = ((g - b) / delta) % 6;
  else if (cmax === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  if (h < 0) h += 360;

  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return { hsl: "hsl(" + h + "," + s + "%," + l + "%)", h, s, l };
};

export const hslToHex = (h, s, l) => {
  s /= 100;
  l /= 100;

  let c = (1 - Math.abs(2 * l - 1)) * s,
    x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
    m = l - c / 2,
    r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }
  // Having obtained RGB, convert channels to hex
  r = Math.round((r + m) * 255).toString(16);
  g = Math.round((g + m) * 255).toString(16);
  b = Math.round((b + m) * 255).toString(16);

  // Prepend 0s, if necessary
  if (r.length === 1) r = "0" + r;
  if (g.length === 1) g = "0" + g;
  if (b.length === 1) b = "0" + b;

  return "#" + r + g + b;
};

export const hslaToHexA = (h, s, l, a) => {
  s /= 100;
  l /= 100;

  let c = (1 - Math.abs(2 * l - 1)) * s,
    x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
    m = l - c / 2,
    r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }
  // Having obtained RGB, convert channels to hex
  r = Math.round((r + m) * 255).toString(16);
  g = Math.round((g + m) * 255).toString(16);
  b = Math.round((b + m) * 255).toString(16);

  a = Math.round(a * 255).toString(16);

  if (r.length === 1) r = "0" + r;
  if (g.length === 1) g = "0" + g;
  if (b.length === 1) b = "0" + b;
  if (a.length === 1) a = "0" + a;

  return "#" + r + g + b + a;
};
