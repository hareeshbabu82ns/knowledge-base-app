import { Box, Stack, Typography, useTheme } from "@mui/material";
import React from "react";
import SketchColorPicker from "./SketchColorPicker";

const PrintPaletteColors = () => {
  const theme = useTheme();

  return (
    <Box
      display="grid"
      gridTemplateColumns="repeat(4,minmax(0,1fr))"
      justifyContent="space-between"
      rowGap={5}
      columnGap={3}
      backgroundColor={theme.palette.background.tile}
      borderRadius="0.55rem"
      p="1rem"
      sx={{
        "& > div": { gridColumn: { xs: "span 4", sm: "span 2", md: "span 1" } },
      }}
    >
      <PrintColorList palette={theme.palette.primary} title="Primary" />
      {/* <PrintColorList
        palette={theme.palette.colors.primaryTones}
        title="Primary Tones"
      /> */}
      <PrintColorList palette={theme.palette.secondary} title="Secondary" />
      {/* <PrintColorList
        palette={theme.palette.colors.secondaryTones}
        title="Secondary Tones"
      /> */}
      <PrintColorList palette={theme.palette.tertiary} title="Tertiary" />
      {/* <PrintColorList
        palette={theme.palette.colors.tertiaryTones}
        title="Tertiary Tones"
      /> */}
      <PrintColorList palette={theme.palette.background} title="Background" />
      <PrintColorList palette={theme.palette.text} title="Text" />

      <PrintColorList palette={theme.palette.success} title="Success" />
      <PrintColorList palette={theme.palette.info} title="Info" />
      <PrintColorList palette={theme.palette.warning} title="Warning" />
      <PrintColorList palette={theme.palette.error} title="Error" />
      {/* <PrintColorList
        palette={theme.palette.colors.errorTones}
        title="Error Tones"
      /> */}
      <PrintColorList palette={theme.palette.grey} title="Grey" />
      <PrintColorList
        palette={theme.palette.colors.neutralTones}
        title="Neutral"
      />
    </Box>
  );
};

const PrintColorList = ({ palette, title }) => {
  // return <pre>{JSON.stringify(palette)}</pre>;
  return (
    <Stack gap={2}>
      <Typography variant="h4">{title}</Typography>
      {Object.keys(palette).map((k) => (
        <SketchColorPicker
          key={`${title}-${k}`}
          colorKey={k}
          color={palette[k]}
          contrastText={palette["contrastText"]}
          disabled
        />
      ))}
    </Stack>
  );
};

export default PrintPaletteColors;
