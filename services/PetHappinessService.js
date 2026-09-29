const MIN_HAPPINESS = 0;
const MAX_HAPPINESS = 100;

const HAPPINESS_DECAY_PER_HOUR = 1;
const HAPPINESS_GRACE_HOURS = 6;

// Bajo este umbral la mascota se pone triste aunque la última noche
// haya sido buena (la felicidad acumulada manda sobre el score puntual)
export const HAPPINESS_SAD_BELOW = 25;

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

// Mood efectivo: la felicidad muy baja pisa hacia triste (solo degrada,
// nunca mejora lo que el score de la última noche diga).
export function moodForHappiness(happiness, scoreMood) {
  if (typeof happiness === "number" && happiness < HAPPINESS_SAD_BELOW) {
    return "sad";
  }
  return scoreMood;
}

// +4h diferido: al detectar el cruce el usuario está dentro de la app;
// el aviso solo tiene valor cuando ya soltó el teléfono
export const PET_ALERT_DELAY_SEC = 4 * 3600;

// Decisión pura de la alerta (testeable sin RN): felicidad bajo umbral,
// sin sesión activa y sin aviso ya enviado hoy (cooldown 1/día)
export function shouldSchedulePetAlert({
  happiness,
  sleepSessionActive,
  lastAlertDateKey,
  todayKey,
}) {
  if (typeof happiness !== "number" || happiness >= HAPPINESS_SAD_BELOW) return false;
  if (sleepSessionActive) return false;
  if (lastAlertDateKey === todayKey) return false;
  return true;
}
