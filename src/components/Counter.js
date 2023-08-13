import React, {useEffect, useState} from "react";

export const REFRESH_INTERVAL = 60; // seconds
let interval;

const Counter = ({routeId, getVehicles, liveBusesFunction}) => {
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);

  // countdown timer
  useEffect(() => {
    if (countdown === 0) {
      if (routeId === "-1") {
          liveBusesFunction();
      } else {
          getVehicles();
      }
      setCountdown(REFRESH_INTERVAL);
    }
    interval = setInterval(() => {
      setCountdown(countdown - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown, routeId, getVehicles, liveBusesFunction]);

  return (
    <>
      <div className='refresh-countdown'>{countdown}</div>
      <div className='refresh-countdown-label'>update in</div>
      <div className='refresh-countdown-label refresh-countdown-label-bottom'>seconds</div>
    </>
  );
}

export default Counter;