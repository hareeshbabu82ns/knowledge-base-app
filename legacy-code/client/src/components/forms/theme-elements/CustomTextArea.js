import { TextareaAutosize, styled } from '@mui/material';

export const CustomTextarea = styled(TextareaAutosize)(
  ({ theme }) => `
  width: 100%;
  font-family: ${theme.typography.fontFamily};
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.5;
  padding: 12px;
  border-radius: 5px;
  color: ${theme.palette.mode === 'dark' ? theme.palette.grey[300] : theme.palette.grey[900]};
  background: ${theme.palette.background.paper};
  border: 1px solid ${theme.palette.grey[400]};
  // box-shadow: 0px 1px 1px ${theme.palette.grey[400]};

  &:hover {
    border-color: ${theme.palette.primary[400]};
  }

  &:focus {
    border-color: ${theme.palette.primary[400]};
    box-shadow: 0 0 0 1px ${theme.palette.primary[200]};
  }

  // firefox
  &:focus-visible {
    outline: 0;
  }
`,
);
