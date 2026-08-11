export function calculateGoalHours(age) {

  if (!age || age <= 0) return 8;

  if (age <= 12) return 10;

  if (age <= 18) return 9;

  if (age <= 64) return 8;

  return 7;

}
