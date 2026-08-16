const MIN_HAPPINESS = 0;
const MAX_HAPPINESS = 100;

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

// Cimientos para el decaimiento por tiempo (pendiente):
// al abrir la app se restará según las horas sin dormir.
export function decayPetHappiness(current) {
  return current;
}
