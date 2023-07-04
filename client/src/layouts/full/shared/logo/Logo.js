import { Link } from 'react-router-dom';
import { Typography, styled } from '@mui/material';

const LinkStyled = styled(Link)(() => ({
  paddingTop: 15,
  height: '70px',
  overflow: 'hidden',
  display: 'block',
}));

const Logo = () => {
  return (
    <LinkStyled to="/">
      <Typography variant="h4">KnowledgeBase</Typography>
    </LinkStyled>
  );
};

export default Logo;
