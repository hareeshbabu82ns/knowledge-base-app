import { Box } from "@mui/material";
import React, { useState } from "react";
import { SketchPicker } from "react-color";

function SketchColorPicker({ color: baseColor, onChange }) {
  const [displayColorPicker, showColorPicker] = useState(false);
  const [color, setColor] = useState(baseColor);

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

  const sxSwatch = {
    padding: "5px",
    background: "#fff",
    borderRadius: "1px",
    boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
    display: "inline-block",
    cursor: "pointer",
  };

  const sxColor = {
    width: "36px",
    height: "14px",
    borderRadius: "2px",
    background: color,
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
        <Box sx={sxColor} />
      </Box>
      {displayColorPicker ? (
        <Box sx={sxPopover}>
          <Box sx={sxCover} onClick={handleClose} />
          <SketchPicker color={color} onChange={handleChange} />
        </Box>
      ) : null}
    </div>
  );
}

export default SketchColorPicker;
