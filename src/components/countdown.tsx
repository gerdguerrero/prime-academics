'use client';

import { useEffect, useState } from 'react';

function getSecondsUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
}

export function Countdown() {
  const [seconds, setSeconds] = useState(() => getSecondsUntilMidnight());
  useEffect(() => {
    const timer = setInterval(() => setSeconds(getSecondsUntilMidnight()), 1000);
    return () => clearInterval(timer);
  }, []);
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return <span className="font-mono text-lg font-black text-white">{h}:{m}:{s}</span>;
}
