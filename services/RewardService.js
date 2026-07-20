import { calculateSleepScore } from "./SleepScoreService";

export function calculateSleepRewards({

  hours,

  goalHours,

  unlockCount,

}) {

  const sleepResult = calculateSleepScore({

    hours,

    goalHours,

    unlockCount,

  });

  let coins = 5;

  if (sleepResult.score >= 90) {

    coins = 50;

  }

  else if (sleepResult.score >= 75) {

    coins = 35;

  }

  else if (sleepResult.score >= 60) {

    coins = 20;

  }

  return {

    mood: sleepResult.mood,

    quality: sleepResult.quality,

    score: sleepResult.score,

    penalty: sleepResult.penalty,

    coins,

  };

}