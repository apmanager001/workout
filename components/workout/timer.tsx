import {Pause, Play, RotateCw} from 'lucide-react'
import React, { useState, useEffect, useRef } from "react";

const Timer = () => {
  const [inputMinutes, setInputMinutes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Convert seconds → h/m/s
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  // Start countdown
  const startTimer = () => {
    if (inputMinutes <= 0) return;

    setTimeLeft(inputMinutes * 60);
    setIsRunning(true);
  };

  // Pause / Resume
  const togglePause = () => {
    setIsRunning((prev) => !prev);
  };

  useEffect(() => {
    if (!isRunning) {
      clearInterval(intervalRef.current!);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setIsRunning(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current!);
  }, [isRunning]);

  return (
    <div className="rounded-3xl border border-base-300/70 bg-base-100/90 flex justify-center  gap-4 p-5">
      {/* Input */}
      <div className="flex items-center justify-center gap-3">
        <input
          type="number"
          id="minutes"
          className="input input-bordered input-sm max-w-10 text-center"
          placeholder="Minutes"
          value={inputMinutes}
          onChange={(e) => setInputMinutes(Number(e.target.value))}
        />
        <button className="btn btn-primary w-12 btn-sm" onClick={startTimer}>
            {timeLeft <= 0 ? (
              <Play className="h-4 w-4" />
            ) : (
              <RotateCw className="h-4 w-4" />
            )}
        </button>
        <span className="countdown font-mono text-2xl flex items-center gap-1">
          {hours > 0 && (
            <>
              <span
                style={
                  { "--value": hours, "--digits": 2 } as React.CSSProperties
                }
              ></span>
              :
            </>
          )}
          <span
            style={{ "--value": minutes, "--digits": 2 } as React.CSSProperties}
          ></span>
          :
          <span
            style={{ "--value": seconds, "--digits": 2 } as React.CSSProperties}
          ></span>
        </span>
      </div>
      <div className="flex items-center justify-center gap-4">
        {timeLeft > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={togglePause}>
            {isRunning ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Timer;
