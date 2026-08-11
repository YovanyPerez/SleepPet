import {
  saveCurrentSleep,
  getCurrentSleep,
  clearCurrentSleep,
} from "../storage/CurrentSleepStorage";

export async function startSleepSession() {

  const startTime = new Date().toISOString();

  await saveCurrentSleep({

    startTime,

    active: true,

    unlockCount: 0,

    unlockTimes: [],

  });

}

export async function updateUnlockState(unlockCount, unlockTimes) {

  const current = await getCurrentSleep();

  if (!current || !current.active) return;

  await saveCurrentSleep({

    ...current,

    unlockCount,

    unlockTimes,

  });

}

export async function finishSleepSession() {

  const current = await getCurrentSleep();

  if (!current) return null;

  const start = new Date(current.startTime);

  const end = new Date();

  const duration =
    (end.getTime() - start.getTime()) / 1000;

  await clearCurrentSleep();

  return {

    start,

    end,

    seconds: Math.floor(duration),

    hours: Number((duration / 3600).toFixed(2)),

  };

}

export async function getCurrentSleepSession() {

  return await getCurrentSleep();

}

export async function cancelSleepSession() {

  await clearCurrentSleep();

}