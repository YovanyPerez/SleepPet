export function calculateSleepScore({

  hours,

  goalHours,

  unlockCount,

}) {

  let score = 100;

  // ===========================
  // Horas dormidas
  // ===========================

  if (hours < goalHours) {

    score -= Math.round((goalHours - hours) * 10);

  }

  // ===========================
  // Penalización por desbloqueos
  // ===========================

  score -= unlockCount * 5;

  // ===========================
  // Limitar el puntaje
  // ===========================

  if (score > 100) {

    score = 100;

  }

  if (score < 0) {

    score = 0;

  }

  // ===========================
  // Calidad del sueño
  // ===========================

  let quality = "Poor";

  if (score >= 90) {

    quality = "Excellent";

  }

  else if (score >= 75) {

    quality = "Good";

  }

  else if (score >= 60) {

    quality = "Average";

  }

  // ===========================
  // Estado de la mascota
  // ===========================

  let mood = "sad";

  if (score >= 90) {

    mood = "happy";

  }

  else if (score >= 75) {

    mood = "normal";

  }

  else if (score >= 60) {

    mood = "sleepy";

  }

  // ===========================
  // Resultado
  // ===========================

  return {

    score,

    quality,

    mood,

    penalty: unlockCount * 5,

  };

}