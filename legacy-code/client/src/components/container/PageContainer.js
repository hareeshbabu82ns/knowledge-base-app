import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { useDispatch } from 'react-redux';
import { setHeader } from 'state';
import { Box } from '@mui/material';

const PageContainer = ({ title, description, children, sx }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setHeader({ header: title, subHeader: description }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description]);
  return (
    <Box sx={{ m: { xs: '1rem 0.5rem', md: '1rem 1.5rem' }, ...sx }}>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Helmet>
      {children}
    </Box>
  );
};

PageContainer.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  children: PropTypes.node,
  sx: PropTypes.object,
};

export default PageContainer;
