import { useMediaQuery } from '@mui/material';
import React from 'react';
import IncidentGrid from './IncidentGrid';
import IncidentList from './IncidentList';

const IncidentsWrapper = () => {
  const smUp = useMediaQuery((theme) => theme.breakpoints.up(500));
  return smUp ? <IncidentGrid /> : <IncidentList />;
};

export default IncidentsWrapper;
