export const MIN_SLEEP_HOURS = 0.5;

export function isSleepSessionValid(hours) {

  return hours >= MIN_SLEEP_HOURS;

}