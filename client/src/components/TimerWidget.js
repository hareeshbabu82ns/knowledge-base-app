import { Button } from '@mui/material';
import { Duration } from 'luxon';
import React, { useState, useEffect } from 'react';
import StartIcon from '@mui/icons-material/PlayArrowOutlined';
import StopIcon from '@mui/icons-material/StopOutlined';

function TimerWidget({ running, runtime, onStart, onStop }) {
  const [seconds, setSeconds] = useState(runtime);
  const [isRunning, setIsRunning] = useState(running);

  useEffect(() => {
    // console.log(running, runtime);
    setSeconds(runtime);
    setIsRunning(running);
  }, [running, runtime]);

  useEffect(() => {
    let interval;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  if (onStart && onStop)
    return (
      <Button
        variant={isRunning ? 'contained' : 'outlined'}
        endIcon={isRunning ? <StopIcon /> : <StartIcon />}
        onClick={() => (isRunning ? onStop() : onStart())}
      >
        {Duration.fromObject({ seconds }).toFormat('hh:mm:ss')}
      </Button>
    );

  return <p>{Duration.fromObject({ seconds }).toFormat('hh:mm:ss')}</p>;
}

export default TimerWidget;
