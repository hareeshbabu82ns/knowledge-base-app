import { Box, Stack, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { SketchPicker } from "react-color";
import tinycolor from "tinycolor2";
import { useDebounce } from "./debounceHook";

const sxSwatch = {
  padding: "5px",
  background: "#fff",
  borderRadius: "1px",
  boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
  display: "inline-block",
  cursor: "pointer",
  minWidth: "200px",
};

function SketchColorPicker({ color: baseColor, onChange }) {
  const [displayColorPicker, showColorPicker] = useState(false);
  const [color, setColor] = useState(baseColor);

  const lazyColor = useDebounce(color, 500);

  useEffect(() => {
    if (onChange) onChange(lazyColor);
  }, [lazyColor]);

  useEffect(() => {
    setColor(baseColor);
  }, [baseColor]);

  const tinyColor = tinycolor(baseColor);
  const hsvStr = tinyColor.toHsvString();
  const textColor = tinyColor.getLuminance() > 0.5 ? "black" : "white";

  const handleClick = () => {
    showColorPicker(!displayColorPicker);
  };

  const handleClose = () => {
    showColorPicker(false);
  };

  const handleChange = (color) => {
    setColor(color.hex);
    // if (onChange) onChange(color.hex);
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
  };
  const sxCover = {
    position: "fixed",
    top: "0px",
    right: "0px",
    bottom: "0px",
    left: "0px",
  };

  return (
    <div>
      <Box sx={sxSwatch} onClick={handleClick}>
        <Box sx={{ ...sxColor, backgroundColor: color }}>
          <Stack justifyContent="center" alignItems="center">
            <Typography variant="h4" sx={{ color: textColor }}>
              {color}
            </Typography>
            <Typography variant="body1" sx={{ color: textColor }}>
              {hsvStr}
              {/* {`H: ${h}, S: ${s}, V: ${v}`} */}
            </Typography>
          </Stack>
        </Box>
      </Box>
      {displayColorPicker ? (
        <Box sx={sxPopover}>
          <Box sx={sxCover} onClick={handleClose} />
          <SketchPicker color={color} onChange={handleChange} disableAlpha />
        </Box>
      ) : null}
    </div>
  );
}

export default SketchColorPicker;
