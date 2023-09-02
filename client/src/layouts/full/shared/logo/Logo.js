import { Box, Stack, Typography, useTheme } from '@mui/material';
import logo from 'assets/images/logos/logo.svg';
import { AppBarStyled, ToolbarStyled } from 'layouts/full/header/Header';

const Logo = () => {
  const theme = useTheme();
  return (
    <AppBarStyled position="sticky" color="default" elevation={0}>
      <ToolbarStyled sx={{ alignItems: 'center' }} disableGutters>
        <Stack direction={'row'} gap={2}>
          <img src={logo} alt="Logo" />
          <Typography variant="h4" color={theme.palette.tertiary.main}>
            KnowledgeBase
          </Typography>
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

export default Logo;
