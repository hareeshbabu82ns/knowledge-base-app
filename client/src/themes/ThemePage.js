import React, { useEffect, useState } from "react";
import tinycolor from "tinycolor2";
import { Box, Button, Stack, Typography, useTheme } from "@mui/material";
import Header from "components/Header";
import PrintPaletteColors from "components/PrintPaletteColors";
import FlexBetween from "components/FlexBetween";
import SketchColorPicker from "components/SketchColorPicker";
import { useDispatch, useSelector } from "react-redux";
import { setThemeColors } from "state/themeSlice";
import { ColorizeOutlined as BaseColorIcon } from "@mui/icons-material";

const BaseColors = () => {
  const theme = useTheme();

  const dispatch = useDispatch();
  const themeColors = useSelector((state) => state.theme);

  const [primaryColor, setPrimaryColor] = useState(theme.palette.primary.main);
  const [secondaryColor, setScondaryColor] = useState(
    theme.palette.secondary.main
  );
  const [tertiaryColor, setTertiaryColor] = useState(
    theme.palette.tertiary[500]
  );

  useEffect(() => {
    setPrimaryColor(theme.palette.primary.main);
    setScondaryColor(theme.palette.secondary.main);
    setTertiaryColor(theme.palette.tertiary[500]);
  }, [theme]);

  const handleColorChange = (colorKey, color) =>
    dispatch(
      setThemeColors({
        ...themeColors,
        [colorKey]: color,
      })
    );

  const genBaseColor = (c) =>
    dispatch(
      setThemeColors({
        baseColor: tinycolor.random().toHexString(),
      })
    );

  const genTertiaryColors = () => {
    const colors = tinycolor
      .random()
      .triad()
      .map((c) => c.toHexString());

    dispatch(
      setThemeColors({
        baseColor: colors[0],
        secondaryColor: colors[1],
        tertiaryColor: colors[3],
      })
    );
  };

  return (
    <Box
      backgroundColor={theme.palette.background.tile}
      display="flex"
      p="1rem"
      mt="2rem"
    >
      <Stack direction="column" gap={4}>
        <Stack direction="row" gap={2}>
          <Button color="primary" variant="contained" onClick={genBaseColor}>
            <BaseColorIcon sx={{ mr: "10px" }} />
            Generate Base Color
          </Button>
          <Button
            color="primary"
            variant="contained"
            onClick={genTertiaryColors}
          >
            <BaseColorIcon sx={{ mr: "10px" }} />
            Generate Tri Colors
          </Button>
        </Stack>
        <Stack direction="row" gap={2}>
          <Stack rowGap={1}>
            <Typography variant="h4">Base Color</Typography>
            <SketchColorPicker
              color={primaryColor}
              onChange={(c) => handleColorChange("baseColor", c)}
            />
          </Stack>
          <Stack rowGap={1}>
            <Typography variant="h4">Secondary Color</Typography>
            <SketchColorPicker
              color={secondaryColor}
              onChange={(c) => handleColorChange("secondaryColor", c)}
            />
          </Stack>
          <Stack rowGap={1}>
            <Typography variant="h4">Tertiary Color</Typography>
            <SketchColorPicker
              color={tertiaryColor}
              onChange={(c) => handleColorChange("tertiaryColor", c)}
            />
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};

const ThemePage = () => {
  const theme = useTheme();

  return (
    <Box m="1.5rem 2.5rem">
      <FlexBetween>
        <Header title="Theme Settings" subtitle="Manage Theme Settings" />
      </FlexBetween>

      <Stack direction="column" gap={2}>
        {/* Base Colors  */}
        <BaseColors />

        {/* Palette  */}
        <Box
          backgroundColor={theme.palette.background.tile}
          display="flex"
          p="1rem"
          mt="1rem"
        >
          <PrintPaletteColors />
        </Box>
      </Stack>
    </Box>
  );
};

export default ThemePage;
