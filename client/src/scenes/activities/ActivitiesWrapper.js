import { useMediaQuery } from '@mui/material';
import React from 'react';
import ActivityGrid from './ActivityGrid';
import ActivityList from './ActivityList';

const ActivitiesWrapper = () => {
  const smUp = useMediaQuery((theme) => theme.breakpoints.up(500));
  return smUp ? <ActivityGrid /> : <ActivityList />;
};

export default ActivitiesWrapper;
