import React, { useEffect, useState } from "react";
import tinycolor from "tinycolor2";
import { Box, Button, Stack, Typography, useTheme } from "@mui/material";
import SketchColorPicker from "components/SketchColorPicker";
import { useDispatch, useSelector } from "react-redux";
import { setThemeColors } from "state/themeSlice";
import {
  ColorizeOutlined as BaseColorIcon,
  ColorLensOutlined,
} from "@mui/icons-material";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";

const ThemeGenerator = ({ isSidebar }) => {
  const theme = useTheme();

  const dispatch = useDispatch();
  const themeColors = useSelector((state) => state.theme);

  const [primaryColor, setPrimaryColor] = useState(themeColors.baseColor);
  const [secondaryColor, setScondaryColor] = useState(
    themeColors.secondaryColor
  );
  const [tertiaryColor, setTertiaryColor] = useState(themeColors.tertiaryColor);

  useEffect(() => {
    setPrimaryColor(themeColors.baseColor);
    setScondaryColor(themeColors.secondaryColor);
    setTertiaryColor(themeColors.tertiaryColor);
    // setPrimaryColor(theme.palette.primary.main);
    // setScondaryColor(theme.palette.secondary.main);
    // setTertiaryColor(theme.palette.tertiary[500]);
  }, [theme, themeColors]);

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
        tertiaryColor: colors[2],
      })
    );
  };

  return (
    <Box
      backgroundColor={isSidebar ? "inherited" : theme.palette.background.tile}
      display="flex"
      p="1rem"
      mt={isSidebar ? "none" : "2rem"}
    >
      <Stack direction="column" gap={4} sx={{ flexGrow: 1 }}>
        <Stack direction="row" gap={2}>
          <ColorLensOutlined
            fontSize="small"
            sx={{ color: theme.palette.tertiary[900] }}
          />
          <Typography variant="h4" color={theme.palette.tertiary[700]}>
            Theme Generator
          </Typography>
        </Stack>
        <Stack direction={isSidebar ? "column" : "row"} gap={2}>
          <Button color="primary" variant="contained" onClick={genBaseColor}>
            {/* <BaseColorIcon sx={{ mr: "10px" }} /> */}
            Generate Base Color
          </Button>
          <Button
            color="primary"
            variant="contained"
            onClick={genTertiaryColors}
          >
            {/* <BaseColorIcon sx={{ mr: "10px" }} /> */}
            Generate Tri Colors
          </Button>
        </Stack>

        <Grid2 container spacing={2} columns={isSidebar ? 1 : 3}>
          <Grid2 xs={3} md={1}>
            <Stack rowGap={1}>
              <Typography variant="h4">Base Color</Typography>
              <SketchColorPicker
                color={primaryColor}
                varient="chrome"
                onChange={(c) => handleColorChange("baseColor", c)}
              />
            </Stack>
          </Grid2>
          <Grid2 xs={3} md={1}>
            <Stack rowGap={1}>
              <Typography variant="h4">Secondary Color</Typography>
              <SketchColorPicker
                color={secondaryColor}
                varient="chrome"
                onChange={(c) => handleColorChange("secondaryColor", c)}
              />
            </Stack>
          </Grid2>
          <Grid2 xs={3} md={1}>
            <Stack rowGap={1}>
              <Typography variant="h4">Tertiary Color</Typography>
              <SketchColorPicker
                color={tertiaryColor}
                varient="chrome"
                onChange={(c) => handleColorChange("tertiaryColor", c)}
              />
            </Stack>
          </Grid2>
        </Grid2>
      </Stack>
    </Box>
  );
};

export default ThemeGenerator;
