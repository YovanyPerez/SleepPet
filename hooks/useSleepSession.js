import { useEffect, useState } from "react";

import {
  startSleepSession,
  getCurrentSleepSession,
  cancelSleepSession,
} from "../services/SleepService";

export default function useSleepSession() {

  const [running, setRunning] = useState(false);

  const [seconds, setSeconds] = useState(0);

  useEffect(() => {

    checkRunningSession();

  }, []);

  useEffect(() => {

    let timer;

    if (running) {

      timer = setInterval(async () => {

        const current = await getCurrentSleepSession();

        if (current) {

          const start = new Date(current.startTime);

          const now = new Date();

          const elapsed = Math.floor(
            (now.getTime() - start.getTime()) / 1000
          );

          setSeconds(elapsed);

        }

      }, 1000);

    }

    return () => clearInterval(timer);

  }, [running]);

  async function checkRunningSession() {

    const current = await getCurrentSleepSession();

    if (current) {

      setRunning(true);

      const start = new Date(current.startTime);

      const now = new Date();

      const elapsed = Math.floor(
        (now.getTime() - start.getTime()) / 1000
      );

      setSeconds(elapsed);

    }

  }

  async function startSleep() {

    await startSleepSession();

    setRunning(true);

    setSeconds(0);

  }

  async function cancelSleep() {

    await cancelSleepSession();

    setRunning(false);

    setSeconds(0);

  }

  function stopTimer() {

    setRunning(false);

  }

  function formatTime() {

    const h = Math.floor(seconds / 3600);

    const m = Math.floor((seconds % 3600) / 60);

    const s = seconds % 60;

    return `${h}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;

  }

  return {

    running,

    seconds,

    startSleep,

    cancelSleep,

    stopTimer,

    formatTime,

  };

}