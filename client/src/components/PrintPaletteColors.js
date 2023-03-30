import { Box, Typography, useTheme } from "@mui/material";
import { Stack } from "@mui/system";
import React from "react";
import tinycolor from "tinycolor2";

// import { hexToHsv } from "themes/utils";

const PrintPaletteColors = () => {
  const theme = useTheme();

  return (
    <Stack direction="row" columnGap={2} flexWrap>
      <PrintColorList palette={theme.palette.primary} title="Primary" />
      <PrintColorList palette={theme.palette.secondary} title="Secondary" />
      <PrintColorList palette={theme.palette.tertiary} title="Tertiary" />
      <PrintColorList palette={theme.palette.success} title="Success" />
      <PrintColorList palette={theme.palette.info} title="Info" />
      <PrintColorList palette={theme.palette.warning} title="Warning" />
      <PrintColorList palette={theme.palette.error} title="Error" />
      <PrintColorList palette={theme.palette.grey} title="Grey" />
      <PrintColorList palette={theme.palette.background} title="Background" />
      <PrintColorList palette={theme.palette.text} title="Text" />
    </Stack>
  );
};

const PrintColorList = ({ palette, title }) => {
  // return <pre>{JSON.stringify(palette)}</pre>;
  return (
    <Stack rowGap={1}>
      <Typography variant="h4">{title}</Typography>
      {Object.keys(palette).map((k) => (
        <PrintColorItem
          key={`${title}-${k}`}
          colorKey={k}
          color={palette[k]}
          contrastText={palette["contrastText"]}
        />
      ))}
    </Stack>
  );
};

const sxSwatch = {
  padding: "5px",
  background: "#fff",
  borderRadius: "1px",
  boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
  minWidth: "200px",
};

export const PrintColorItem = ({ colorKey, color, contrastText }) => {
  const tinyColor = tinycolor(color);
  // const { h, s, v } = tinyColor.toHsv();
  const hsvStr = tinyColor.toHsvString();
  // const { h, s, v } = hexToHsv(color);
  const textColor = tinyColor.getLuminance() > 0.5 ? "black" : "white";
  return (
    <Box sx={sxSwatch}>
      <Box
        sx={{
          width: "100%",
          height: 50,
          borderRadius: "2px",
          background: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack justifyContent="center" alignItems="center">
          <Stack direction="row" gap={1}>
            <Typography variant="h5" sx={{ color: textColor }}>
              {colorKey}
            </Typography>
            <Typography variant="body2" sx={{ color: textColor }}>
              {color}
            </Typography>
          </Stack>
          <Typography variant="body1" sx={{ color: textColor }}>
            {hsvStr}
            {/* {`H: ${h}, S: ${s}, V: ${v}`} */}
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default PrintPaletteColors;
