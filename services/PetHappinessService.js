const MIN_HAPPINESS = 0;
const MAX_HAPPINESS = 100;

const HAPPINESS_DECAY_PER_HOUR = 1;
const HAPPINESS_GRACE_HOURS = 6;

export function calculatePetHappiness(current, { score, hours }) {

  let delta = 0;

  if (score >= 90) {
    delta += 10;
  } else if (score >= 75) {
    delta += 6;
  } else if (score >= 60) {
    delta += 2;
  } else {
    delta -= 12;
  }

  if (hours >= 7) {
    delta += 2; // bonus por buena noche / racha
  }

  return Math.max(
    MIN_HAPPINESS,
    Math.min(MAX_HAPPINESS, current + delta)
  );

}

// Decaimiento por tiempo: se aplica al abrir la app.
// Tras HAPPINESS_GRACE_HOURS horas sin dormir, se resta
// HAPPINESS_DECAY_PER_HOUR por cada hora adicional despierto.
export function decayPetHappiness(current, elapsedHours = 0) {

  const decayedHours = elapsedHours - HAPPINESS_GRACE_HOURS;

  if (decayedHours <= 0) {
    return current;
  }

  const lost = Math.round(
    decayedHours * HAPPINESS_DECAY_PER_HOUR
  );

  return Math.max(
    MIN_HAPPINESS,
    Math.min(MAX_HAPPINESS, current - lost)
  );

}
