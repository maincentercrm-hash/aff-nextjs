import React, { useState, useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import actionUpdate from '@/action/crud/update';

// Type definition for the props
interface CountdownProps {
  expire: any;
  missionId: string;
  onExpire: () => void;
  log: any;
}

// Type definition for the time left object
interface TimeLeft {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

function Countdown({ expire, missionId, onExpire, log }: CountdownProps) {
  const queryClient = useQueryClient()
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(expire));

  // Function to calculate time left until the target date
  function calculateTimeLeft(endDate: string): TimeLeft {
    const difference = +new Date(endDate) - +new Date();
    let timeLeft: TimeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  }

  // Update the timer every second
  useEffect(() => {
    const timer = setTimeout(() => {
      const newTimeLeft = calculateTimeLeft(expire);

      setTimeLeft(calculateTimeLeft(expire));

      if (Object.keys(newTimeLeft).length === 0) {
        // Time is up, call updateBooking and invalidate queries
        (async () => {

          const missionData = {
            _id: missionId,
            status: 'expire'
          }

          const missionLog = {
            _id: log._id,
            status: 'expire'
          }

          await actionUpdate('tbl_mission', missionData);
          await actionUpdate('tbl_mission_logs', missionLog);

          queryClient.invalidateQueries({ queryKey: ['tbl_mission', 'status', 'publish'] });
          queryClient.invalidateQueries({ queryKey: ["tbl_mission_logs", "tel", log.tel] });

          onExpire()
        })();

      }


    }, 1000);



    // Cleanup the timer
    return () => clearTimeout(timer);
  });

  // Generate the timer components with Thai labels
  const timerComponents: JSX.Element[] = [];

  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval as keyof TimeLeft]) {
      return;
    }

    const labelMap: { [key: string]: string } = {
      days: 'วัน',
      hours: 'ชั่วโมง',
      minutes: 'นาที',
      seconds: 'วินาที',
    };

    timerComponents.push(
      <span key={interval}>
        {timeLeft[interval as keyof TimeLeft]} {labelMap[interval]}{" "}
      </span>
    );
  });

  return (
    <div>
      {timerComponents.length ? <span>เหลือเวลา : {timerComponents}</span> : <span>หมดเวลากิจกรรม!</span>}
    </div>
  );
}

// Definition for the outer component props, assuming `info` has a certain structure

interface MyComponentProps {
  expire: any;
  missionId: string;
  onExpire: () => void;
  log: any;
}

export function TimeCounter({ expire, missionId, onExpire, log }: MyComponentProps) {


  return (
    <div className='text-xs'>
      <Countdown expire={expire} missionId={missionId} onExpire={onExpire} log={log} />
    </div>
  );
}
