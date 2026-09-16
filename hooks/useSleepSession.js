import { useEffect, useState } from "react";

import {
  startSleepSession,
} from "../services/SleepService";

import { getCurrentSleep } from "../storage/CurrentSleepStorage";

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

        const current = await getCurrentSleep();

        if (current) {

          setSeconds(elapsedSeconds(current));

        }

      }, 1000);

    }

    return () => clearInterval(timer);

  }, [running]);

  function elapsedSeconds(current) {

    return Math.floor(
      (Date.now() - new Date(current.startTime).getTime()) / 1000
    );

  }

  async function checkRunningSession() {

    const current = await getCurrentSleep();

    if (current) {

      setRunning(true);

      setSeconds(elapsedSeconds(current));

    }

  }

  async function startSleep() {

    await startSleepSession();

    setRunning(true);

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

    startSleep,

    stopTimer,

    formatTime,

  };

}