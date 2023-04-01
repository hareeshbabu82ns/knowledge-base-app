import { useTheme } from "@emotion/react";
import { Box, Stack, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { ChromePicker, SliderPicker } from "react-color";
import tinycolor from "tinycolor2";
// import { useDebounce } from "./debounceHook";

const sxSwatch = {
  padding: "5px",
  background: "#fff",
  borderRadius: "1px",
  boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
  minWidth: "200px",
};

const sxColor = {
  width: "100%",
  height: 50,
  borderRadius: "2px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const sxPopover = {
  position: "absolute",
  zIndex: "2",
  padding: "8px",
};
const sxCover = {
  position: "fixed",
  top: "0px",
  right: "0px",
  bottom: "0px",
  left: "0px",
};

function SketchColorPicker({
  colorKey,
  color: baseColor,
  onChange,
  disabled,
  varient = "chrome", // chrome, slider
  displayColorSpace = "hsl", // hsl, hsv, rgb
}) {
  const theme = useTheme();

  const [displayColorPicker, showColorPicker] = useState(false);
  const [color, setColor] = useState(baseColor);

  // const lazyColor = useDebounce(color, 500);

  // useEffect(() => {
  //   if (onChange) onChange(lazyColor);
  // }, [lazyColor]);

  useEffect(() => {
    setColor(baseColor);
  }, [baseColor]);

  const tinyColor = tinycolor(baseColor);
  const textColor = tinyColor.getLuminance() > 0.5 ? "black" : "white";
  const hsvStr =
    displayColorSpace === "hsl"
      ? tinyColor.toHslString()
      : displayColorSpace === "rgb"
      ? tinyColor.toRgbString()
      : tinyColor.toHsvString();

  const isChrome = varient === "chrome";
  const isSlider = varient === "slider";

  const handleClick = () => {
    showColorPicker(!displayColorPicker);
  };

  const handleClose = () => {
    showColorPicker(false);
  };

  const handleChange = (color) => {
    setColor(color.hex);
    if (onChange) onChange(color.hex);
  };

  return (
    <div>
      <Box
        sx={{
          ...sxSwatch,
          cursor: disabled || isSlider ? "inherited" : "pointer",
        }}
        onClick={handleClick}
      >
        <Stack gap={2} mb={!disabled && isSlider ? 1 : 0}>
          <Box sx={{ ...sxColor, backgroundColor: color }}>
            <Stack justifyContent="center" alignItems="center">
              <Stack gap={1} direction="row">
                {colorKey && (
                  <Typography variant="h5" sx={{ color: textColor }}>
                    {colorKey}
                  </Typography>
                )}
                <Typography variant="h4" sx={{ color: textColor }}>
                  {color}
                </Typography>
              </Stack>
              <Typography variant="body1" sx={{ color: textColor }}>
                {hsvStr}
                {/* {`H: ${h}, S: ${s}, V: ${v}`} */}
              </Typography>
            </Stack>
          </Box>
          {!disabled && isSlider && (
            <SliderPicker color={color} onChangeComplete={handleChange} />
          )}
        </Stack>
      </Box>
      {!disabled && isChrome && displayColorPicker ? (
        <Box sx={{ ...sxPopover, bgcolor: theme.palette.grey[600] }}>
          <Box sx={sxCover} onClick={handleClose} />
          <ChromePicker
            color={color}
            onChangeComplete={handleChange}
            disableAlpha
          />
        </Box>
      ) : null}
    </div>
  );
}

export default SketchColorPicker;
