import { toDateKey } from "../utils/dateUtils.js";

// Regla B: sesiones >= 3h cuentan 1 vez por dia;
// siestas cortas son neutras; saltarse un dia completo rompe la racha.
export const STREAK_MIN_HOURS = 3;

function getYesterdayKey(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return toDateKey(d);
}

export function computeStreakUpdate({
  currentStreak,
  lastStreakDateKey,
  sessionEnd,
  hoursSlept,
  shields = 0,
}) {
  const todayKey = toDateKey(sessionEnd);

  // Siesta corta: no suma ni rompe
  if (!hoursSlept || hoursSlept < STREAK_MIN_HOURS) {
    return { streak: currentStreak, lastStreakDateKey, shields };
  }

  // Ya contada hoy
  if (lastStreakDateKey === todayKey) {
    return { streak: currentStreak, lastStreakDateKey, shields };
  }

  // Migracion: primera vez que se estampa fecha -> conservar racha actual
  if (!lastStreakDateKey) {
    return {
      streak: Math.max(currentStreak, 1),
      lastStreakDateKey: todayKey,
      shields,
    };
  }

  // Dia consecutivo
  if (lastStreakDateKey === getYesterdayKey(sessionEnd)) {
    return { streak: currentStreak + 1, lastStreakDateKey: todayKey, shields };
  }

  // Hueco de un dia completo o mas: el escudo absorbe el dia perdido
  // (se consume 1) y la cadena continua; sin escudo, reinicia.
  if (shields > 0) {
    console.log("Escudo de racha usado: dia perdido absorbido");
    return {
      streak: currentStreak + 1,
      lastStreakDateKey: todayKey,
      shields: shields - 1,
    };
  }

  return { streak: 1, lastStreakDateKey: todayKey, shields };
}
