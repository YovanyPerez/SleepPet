import { calculateSleepScore } from "./SleepScoreService";

export function calculateSleepRewards(args) {

  const sleepResult = calculateSleepScore(args);

  const coins =
    sleepResult.score >= 90 ? 50 :
    sleepResult.score >= 75 ? 35 :
    sleepResult.score >= 60 ? 20 : 5;

  return {

    ...sleepResult,

    coins,

  };

}