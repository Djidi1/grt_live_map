import React, {useEffect, useState} from "react";

export const REFRESH_INTERVAL = 60; // seconds

const Counter = ({routeId, getVehicles}) => {
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);

  // countdown timer
  useEffect(() => {
    if (countdown === 0) {
      getVehicles();
      setCountdown(REFRESH_INTERVAL);
    }
    const interval = setInterval(() => {
      setCountdown(countdown - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown, routeId, getVehicles]);

  return (
    <>
      <div className='refresh-countdown'>{countdown}</div>
      <div className='refresh-countdown-label'>update in</div>
      <div className='refresh-countdown-label refresh-countdown-label-bottom'>seconds</div>
    </>
  );
}

export default Counter;