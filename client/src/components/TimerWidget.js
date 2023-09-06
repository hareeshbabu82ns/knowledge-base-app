import { set } from 'lodash';
import { Duration } from 'luxon';
import React, { useState, useEffect } from 'react';

function TimerWidget({ running, runtime }) {
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

  // const startTimer = () => {
  //   setIsRunning(true);
  // };

  // const stopTimer = () => {
  //   setIsRunning(false);
  // };

  // const resetTimer = () => {
  //   setIsRunning(false);
  //   setSeconds(0);
  // };

  return <p>{Duration.fromObject({ seconds }).toFormat('hh:mm:ss')}</p>;
}

export default TimerWidget;
