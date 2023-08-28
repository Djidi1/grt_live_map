import React, {useEffect, useState} from "react";
import {REFRESH_TIMEOUT} from "../constants";
let interval;

const Counter = () => {
  const [countdown, setCountdown] = useState(REFRESH_TIMEOUT);

  // countdown timer
  useEffect(() => {
    if (countdown === 0) {
      setCountdown(REFRESH_TIMEOUT);
    }
    interval = setInterval(() => {
      setCountdown(countdown - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  return (
    <>
      <div className='refresh-countdown'>{countdown}</div>
      <div className='refresh-countdown-label'>update in</div>
      <div className='refresh-countdown-label refresh-countdown-label-bottom'>seconds</div>
    </>
  );
}

export default Counter;