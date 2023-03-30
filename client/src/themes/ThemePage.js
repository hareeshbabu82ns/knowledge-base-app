import React from "react";
import { Box, Stack, useTheme } from "@mui/material";
import Header from "components/Header";
import PrintPaletteColors from "components/PrintPaletteColors";
import FlexBetween from "components/FlexBetween";
import SketchColorPicker from "components/SketchColorPicker";
import { useDispatch, useSelector } from "react-redux";
import { setBaseColor } from "state";

const ThemePage = () => {
  const theme = useTheme();

  const dispatch = useDispatch();
  const baseColor = useSelector((state) => state.global.baseColor);

  const handleColorChange = (c) => dispatch(setBaseColor({ baseColor: c }));

  return (
    <Box m="1.5rem 2.5rem">
      <FlexBetween>
        <Header title="Theme Settings" subtitle="Manage Theme Settings" />

        <Stack direction="row" gap={2} alignItems="center">
          <SketchColorPicker color={baseColor} onChange={handleColorChange} />
        </Stack>
      </FlexBetween>

      {/* Palette Row */}
      <Box
        gridColumn="span 12"
        gridRow="span 5"
        backgroundColor={theme.palette.background.tile}
        p="1rem"
        mt="2rem"
        borderRadius="0.55rem"
      >
        <PrintPaletteColors />
      </Box>
    </Box>
  );
};

export default ThemePage;
