import { toDateKey } from "../utils/dateUtils.js";

// Regla B: sesiones >= 3h cuentan 1 vez por dia;
// siestas cortas son neutras; saltarse un dia completo rompe la racha.
export const STREAK_MIN_HOURS = 3;

function getYesterdayKey(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return toDateKey(d);
}

// Dias completos perdidos entre el ultimo sello y hoy.
// 0 = hoy o ayer (racha intacta), 1 = se salto ayer, n = lleva n dias sin dormir.
// ponytail: parseo manual del yyyy-mm-dd; suficiente porque las claves siempre
// son locales a medianoche (toDateKey) y ambos lados se construyen igual.
export function daysMissedBetween(lastStreakDateKey, todayKey) {
  if (!lastStreakDateKey || !todayKey) return 0;
  const a = Date.parse(`${lastStreakDateKey}T00:00:00`);
  const b = Date.parse(`${todayKey}T00:00:00`);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(0, Math.round((b - a) / 86400000) - 1);
}

// Liquidacion por tiempo al abrir la app: sin sesion nueva nada evaluaba el
// hueco, asi que la racha y el escudo quedaban congelados para siempre.
// El escudo se consume una sola vez, en finishSleep (decision unica):
// aqui solo se marca la racha muerta cuando los dias perdidos no caben
// en los escudos disponibles.
export function settleStreakOnLoad({
  streak,
  lastStreakDateKey,
  shields = 0,
  todayKey,
}) {
  const missed = daysMissedBetween(lastStreakDateKey, todayKey);
  if (missed <= 0 || missed <= shields) {
    return { streak, shields, changed: false };
  }
  // Ya en cero: marcar cambio solo provocaria escrituras al abrir en cada
  // arranque, sin modificar nada.
  if (!streak && !shields) {
    return { streak, shields, changed: false };
  }
  console.log(`Racha rota por inactividad: ${missed} dias perdidos sin escudos`);
  return { streak: 0, shields: 0, changed: true };
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

  // Hueco: cada dia perdido necesita su propio escudo. Con los escudos
  // suficientes la cadena continua; si no, los que habia se gastan y reinicia.
  const missed = daysMissedBetween(lastStreakDateKey, todayKey);
  if (missed > 0 && missed <= shields) {
    console.log(`Escudo de racha usado: ${missed} dias perdidos absorbidos`);
    return {
      streak: currentStreak + 1,
      lastStreakDateKey: todayKey,
      shields: shields - missed,
    };
  }

  return { streak: 1, lastStreakDateKey: todayKey, shields: 0 };
}
