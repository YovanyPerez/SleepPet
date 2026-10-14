import { toDateKey, toSleepDayKey } from "../utils/dateUtils.js";

// Regla B: el dia de sueno (12:00 -> 12:00) cuenta si entre sus sesiones se
// acumulan >= 3h, haya sido una sola noche o una siesta mas la noche.
// Saltarse un dia completo rompe la racha; cada dia perdido cuesta un escudo.
export const STREAK_MIN_HOURS = 3;

// Dia de sueno anterior a una clave de dia de sueno.
// OJO: se resta a la clave, no al Date de fin: con el corte a mediodia, restar
// al Date compararia contra el dia equivocado.
function previousDayKey(key) {
  const d = new Date(`${key}T00:00:00`);
  d.setDate(d.getDate() - 1);
  return toDateKey(d);
}

// Dias completos perdidos entre el ultimo sello y hoy (ambos dias de sueno).
// 0 = hoy o ayer (racha intacta), 1 = se salto ayer, n = lleva n dias sin dormir.
export function daysMissedBetween(lastStreakDateKey, todayKey) {
  if (!lastStreakDateKey || !todayKey) return 0;
  const a = Date.parse(`${lastStreakDateKey}T00:00:00`);
  const b = Date.parse(`${todayKey}T00:00:00`);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(0, Math.round((b - a) / 86400000) - 1);
}

// Horas acumuladas del dia de sueno que termina en `current`: las sesiones ya
// guardadas que caen en ese mismo dia mas la sesion en curso (aun no esta en
// el historial cuando finishSleep consulta la racha).
// ponytail: cada sesion pertenece a un unico dia de sueno (el de su fin), asi
// que no hay doble conteo; se ignoran las entradas viejas sin endMs.
export function sumSleepDayHours(sessions, current) {
  const key = toSleepDayKey(new Date(current.endMs));
  let total = Number(current.hours) || 0;
  for (const s of sessions ?? []) {
    if (!s?.endMs || !s?.hours) continue;
    if (toSleepDayKey(new Date(s.endMs)) === key) {
      total += Number(s.hours) || 0;
    }
  }
  return Math.round(total * 100) / 100;
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
  now = new Date(),
}) {
  const missed = daysMissedBetween(lastStreakDateKey, toSleepDayKey(now));
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
  dayHours,
  shields = 0,
}) {
  const todayKey = toSleepDayKey(new Date(sessionEnd));

  // Dia de sueno corto: no suma ni rompe
  if (!dayHours || dayHours < STREAK_MIN_HOURS) {
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
  if (lastStreakDateKey === previousDayKey(todayKey)) {
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