// Harness para la tienda de consumibles + escudo de racha (ShopService)
// y el auto-consumo del escudo en StreakService.
// Uso: node tools/testShop.js
// Puro, sin React Native.

import {
  CONSUMABLES,
  SHIELD_PRICE,
  RENAME_PRICE,
  applyConsumable,
  meetsLevelRequirement,
} from "../services/ShopService.js";

import {
  computeStreakUpdate,
  settleStreakOnLoad,
  sumSleepDayHours,
  daysMissedBetween,
} from "../services/StreakService.js";

import { toSleepDayKey } from "../utils/dateUtils.js";

let failures = 0;
function check(name, cond) {
  console.log(`${cond ? "OK  " : "FAIL"} | ${name}`);
  if (!cond) failures++;
}

// 1. Catálogo: precios y ganancias positivos, ids únicos
check("catálogo con 3 consumibles", CONSUMABLES.length === 3);
check(
  "ids únicos",
  new Set(CONSUMABLES.map((c) => c.id)).size === CONSUMABLES.length
);
check(
  "precios y ganancias positivos",
  CONSUMABLES.every((c) => c.price > 0 && c.happiness > 0)
);
check("precios de escudo y rename positivos", SHIELD_PRICE > 0 && RENAME_PRICE > 0);

// 2. applyConsumable: suma y clamp 0..100
check("suma felicidad", applyConsumable(40, 15) === 55);
check("clamp en 100", applyConsumable(95, 50) === 100);
check("clamp en 0", applyConsumable(5, -50) === 0);

// 2b. Candado de nivel para comprar mascotas
check("nivel exacto cumple", meetsLevelRequirement({ minLevel: 5 }, 5) === true);
check("nivel mayor cumple", meetsLevelRequirement({ minLevel: 5 }, 99) === true);
check("nivel menor no cumple", meetsLevelRequirement({ minLevel: 5 }, 4) === false);
check("sin minLevel: nivel 1 cumple", meetsLevelRequirement({}, 1) === true);
check("sin minLevel: nivel 1 con cualquier nivel", meetsLevelRequirement({}, 12) === true);
check("sin minLevel: nivel 0 no cumple", meetsLevelRequirement({}, 0) === false);

// ---------------------------------------------------------------------------
// Racha: el dia de sueno va de 12:00 a 12:00. La noche del 11 al 12 termina
// Sept 12 07:00 y cuenta como dia de sueno "2026-09-11".
// ---------------------------------------------------------------------------
const night11 = new Date(2026, 8, 12, 7, 0, 0);
check("noche 11-12 se sella como dia 11", toSleepDayKey(night11) === "2026-09-11");
check("siesta 13:00 cuenta en su mismo dia", toSleepDayKey(new Date(2026, 8, 11, 13, 0, 0)) === "2026-09-11");
check("noche que acaba 23:30 cuenta en su dia", toSleepDayKey(new Date(2026, 8, 11, 23, 30, 0)) === "2026-09-11");
check("siesta 09:00 pertenece al dia anterior", toSleepDayKey(new Date(2026, 8, 11, 9, 0, 0)) === "2026-09-10");
check("noche larga 23:00-09:00 cuenta el dia anterior", toSleepDayKey(new Date(2026, 8, 12, 9, 0, 0)) === "2026-09-11");

// 3. Escudo de racha: hueco de un dia de sueno (sello 09 -> dia 11)
const base = {
  currentStreak: 5,
  lastStreakDateKey: "2026-09-09",
  sessionEnd: night11,
  dayHours: 7,
};

check("hueco de 1 dia: asi se cuenta", daysMissedBetween("2026-09-09", "2026-09-11") === 1);

const withShield = computeStreakUpdate({ ...base, shields: 2 });
check("hueco con escudo: racha continúa", withShield.streak === 6);
check("hueco con escudo: consume 1", withShield.shields === 1);
check("hueco con escudo: fecha estampada", withShield.lastStreakDateKey === "2026-09-11");

const noShield = computeStreakUpdate({ ...base, shields: 0 });
check("hueco sin escudo: racha reinicia", noShield.streak === 1);
check("hueco sin escudo: escudos a 0", noShield.shields === 0);

// 3b. Hueco de varios días: cada día perdido cuesta su escudo
// sello 09-06 -> dia 11 = 4 perdidos (07, 08, 09, 10)
const longGap = {
  currentStreak: 5,
  lastStreakDateKey: "2026-09-06",
  sessionEnd: night11,
  dayHours: 7,
};
check("hueco largo: 4 días perdidos", daysMissedBetween("2026-09-06", "2026-09-11") === 4);

const longWithOne = computeStreakUpdate({ ...longGap, shields: 1 });
check("4 días de hueco con 1 escudo: reinicia", longWithOne.streak === 1);
check("4 días de hueco con 1 escudo: escudos agotados", longWithOne.shields === 0);

const longWithFour = computeStreakUpdate({ ...longGap, shields: 4 });
check("4 días de hueco con 4 escudos: racha continúa", longWithFour.streak === 6);
check("4 días de hueco con 4 escudos: consume 4", longWithFour.shields === 0);

// 4. Escudo intacto cuando no hace falta
const consecutive = computeStreakUpdate({
  currentStreak: 5,
  lastStreakDateKey: "2026-09-10",
  sessionEnd: night11,
  dayHours: 7,
  shields: 2,
});
check("día consecutivo: +1", consecutive.streak === 6);
check("día consecutivo: escudo intacto", consecutive.shields === 2);

const sameDay = computeStreakUpdate({
  currentStreak: 5,
  lastStreakDateKey: "2026-09-11",
  sessionEnd: night11,
  dayHours: 7,
  shields: 2,
});
check("mismo día: racha igual", sameDay.streak === 5);
check("mismo día: escudo intacto", sameDay.shields === 2);

// Un día de sueño con menos de 3h acumuladas no suma ni rompe
const shortDay = computeStreakUpdate({
  currentStreak: 5,
  lastStreakDateKey: "2026-09-09",
  sessionEnd: night11,
  dayHours: 2,
  shields: 1,
});
check("día de sueño corto: neutro", shortDay.streak === 5 && shortDay.lastStreakDateKey === "2026-09-09");
check("día de sueño corto: no consume escudo", shortDay.shields === 1);

const migration = computeStreakUpdate({
  currentStreak: 4,
  lastStreakDateKey: null,
  sessionEnd: night11,
  dayHours: 7,
  shields: 1,
});
check("migración sin sello: conserva la racha", migration.streak === 4);
check("migración sin sello: estampa el día", migration.lastStreakDateKey === "2026-09-11");

// Compatibilidad: sin parámetro shields no explota
const legacy = computeStreakUpdate({
  currentStreak: 5,
  lastStreakDateKey: "2026-09-10",
  sessionEnd: night11,
  dayHours: 7,
});
check("legacy sin shields: +1", legacy.streak === 6);
check("legacy sin shields: shields 0", legacy.shields === 0);

// 5. Suma por día de sueño (regla por día, no por sesión)
const napMs = new Date(2026, 8, 11, 15, 0, 0).getTime();
const nightMs = new Date(2026, 8, 12, 7, 0, 0).getTime();
const hist = [
  { endMs: new Date(2026, 8, 10, 7, 0, 0).getTime(), hours: 8 }, // día 09
  { endMs: napMs, hours: 2 },                                    // día 11
];
check("suma: noche 8h + siesta 2h del mismo día = 10h", sumSleepDayHours(hist, { endMs: nightMs, hours: 8 }) === 10);
check("suma: ignora sesiones de otro día", sumSleepDayHours([{ endMs: napMs, hours: 2 }], { endMs: new Date(2026, 8, 10, 7, 0, 0).getTime(), hours: 8 }) === 8);
check("suma: entrada sin endMs se ignora", sumSleepDayHours([{ hours: 99 }, { endMs: napMs, hours: 2 }], { endMs: nightMs, hours: 8 }) === 10);
check("suma: historial vacío = sesión actual", sumSleepDayHours([], { endMs: nightMs, hours: 8 }) === 8);
check("suma: sin historial ni horas = 0", sumSleepDayHours(null, {}) === 0);

// 6. Liquidación al abrir la app (días sin usar): la racha no puede quedar
// congelada. Un escudo por día perdido, igual que finishSleep.
const now15 = new Date(2026, 8, 15, 20, 0, 0);
check("abrir 15/09 20:00 es día de sueño 15", toSleepDayKey(now15) === "2026-09-15");

const dead = settleStreakOnLoad({
  streak: 5,
  lastStreakDateKey: "2026-09-10",
  shields: 1,
  now: now15,
});
check("4 días perdidos con 1 escudo: racha a 0", dead.streak === 0);
check("4 días perdidos con 1 escudo: escudos a 0", dead.shields === 0);
check("4 días perdidos con 1 escudo: marca cambio", dead.changed === true);

const covered = settleStreakOnLoad({
  streak: 5,
  lastStreakDateKey: "2026-09-10",
  shields: 4,
  now: now15,
});
check("4 días perdidos con 4 escudos: no cambia", covered.streak === 5);
check("4 días perdidos con 4 escudos: escudos intactos", covered.shields === 4);
check("4 días perdidos con 4 escudos: sin cambio", covered.changed === false);

// El corte a mediodía: con el sello en el día 09, el día de sueño 10 (que va
// del 10/09 12:00 al 11/09 12:00) sigue en juego hasta su mediodía
const beforeNoon = settleStreakOnLoad({
  streak: 5,
  lastStreakDateKey: "2026-09-09",
  shields: 0,
  now: new Date(2026, 8, 10, 20, 0, 0),
});
check("abrir 10/09 20:00: el día 10 sigue en juego", beforeNoon.streak === 5);
check("abrir 10/09 20:00: sin cambio", beforeNoon.changed === false);

const afterNoon = settleStreakOnLoad({
  streak: 5,
  lastStreakDateKey: "2026-09-09",
  shields: 0,
  now: new Date(2026, 8, 11, 13, 0, 0),
});
check("abrir 11/09 13:00: el día 10 venció, racha rota", afterNoon.streak === 0);

const sameKey = settleStreakOnLoad({
  streak: 5,
  lastStreakDateKey: "2026-09-15",
  shields: 0,
  now: now15,
});
check("ya contado hoy: intacto", sameKey.streak === 5 && sameKey.changed === false);

const noKey = settleStreakOnLoad({
  streak: 0,
  lastStreakDateKey: null,
  shields: 0,
  now: now15,
});
check("sin sello previo: intacto", noKey.streak === 0 && noKey.changed === false);

const alreadyZero = settleStreakOnLoad({
  streak: 0,
  lastStreakDateKey: "2026-09-01",
  shields: 0,
  now: now15,
});
check("racha ya en 0: no marca cambio", alreadyZero.changed === false);

// 6b. Cambio de hora: el día de sueño no se descuadra
check("DST: noche del 8 al 9 sigue sellando día 8", toSleepDayKey(new Date(2026, 2, 9, 7, 0, 0)) === "2026-03-08");
check("DST: dos noches después, un día perdido", daysMissedBetween("2026-03-08", "2026-03-10") === 1);
check("cruce de mes: 1 día perdido", daysMissedBetween("2026-01-31", "2026-02-02") === 1);
check("cruce de año: hoy es el sello, 0 perdidos", daysMissedBetween("2025-12-31", "2026-01-01") === 0);
check("año nuevo: 30 y 31 perdidos", daysMissedBetween("2025-12-29", "2026-01-01") === 2);
check("clave inválida: 0 perdidos", daysMissedBetween("basura", "2026-09-15") === 0);
check("clave futura: 0 perdidos", daysMissedBetween("2026-09-20", "2026-09-15") === 0);

// 7. Timelines completos: liquidar al abrir + sesiones del día.
// Cada día del plan abre la app a las 08:00 y luego termina las sesiones
// indicadas como [horaFin, horas] de ese día de septiembre.
function quiet(fn) {
  const log = console.log;
  console.log = () => {};
  try {
    return fn();
  } finally {
    console.log = log;
  }
}

function runTimeline(plan, shields = 0) {
  let st = 0;
  let sh = shields;
  let key = null;
  const history = [];
  const trace = [];
  plan.forEach((sessions, i) => {
    const day = i + 1;
    const opened = new Date(2026, 8, day, 8, 0, 0);
    const settled = quiet(() =>
      settleStreakOnLoad({ streak: st, lastStreakDateKey: key, shields: sh, now: opened })
    );
    if (settled.changed) {
      st = settled.streak;
      sh = settled.shields;
    }
    for (const [endHour, hours] of sessions) {
      const endMs = new Date(2026, 8, day, endHour, 0, 0).getTime();
      const current = { endMs, hours };
      const dayHours = quiet(() => sumSleepDayHours(history, current));
      const u = quiet(() =>
        computeStreakUpdate({
          currentStreak: st,
          lastStreakDateKey: key,
          sessionEnd: new Date(endMs),
          dayHours,
          shields: sh,
        })
      );
      st = u.streak;
      sh = u.shields;
      key = u.lastStreakDateKey;
      history.push(current);
    }
    trace.push({ day, streak: st, shields: sh, key });
  });
  return trace;
}

const at = (trace, day) => trace[day - 1];
const end = (trace) => trace[trace.length - 1];

// A: 7 noches seguidas -> 7
const A = runTimeline([[], [[7, 9]], [[7, 9]], [[7, 9]], [[7, 9]], [[7, 9]], [[7, 9]], [[7, 9]]]);
check("A · 7 noches seguidas: racha 7", end(A).streak === 7);
check("A · sello final es el día 7", end(A).key === "2026-09-07");

// B: 3 noches, falta 1, 1 escudo -> la cadena continúa
const B = runTimeline([[], [[7, 9]], [[7, 9]], [[7, 9]], [], [[7, 9]], [[7, 9]]], 1);
check("B · el día saltado no rompe al abrir", at(B, 5).streak === 3);
check("B · vuelve y continúa: racha 5", end(B).streak === 5);
check("B · escudo consumido", end(B).shields === 0);

// C: 3 noches, 5 días de ausencia, 1 escudo -> 0 al abrir y 1 al dormir
const C = runTimeline([[], [[7, 9]], [[7, 9]], [[7, 9]], [], [], [], [], [], [[7, 9]]], 1);
check("C · segundo día de ausencia: racha a 0", at(C, 7).streak === 0);
check("C · escudos a 0", at(C, 7).shields === 0);
check("C · al dormir de nuevo: racha 1", end(C).streak === 1);

// D: siesta + noche (10h) el mismo día de sueño -> la racha continúa
// (antes del corte a mediodía esto reiniciaba la racha en 1)
const D = runTimeline([[], [[7, 9]], [[7, 9]], [[7, 9], [15, 2]], [[7, 8]]]);
check("D · siesta 2h + noche 8h: racha 4", end(D).streak === 4);
check("D · sello sigue el día de la siesta", end(D).key === "2026-09-04");

// E: 3 noches, 3 días de ausencia, 2 escudos -> no alcanzan, reinicia
const E = runTimeline([[], [[7, 9]], [[7, 9]], [[7, 9]], [], [], [], [[7, 9]]], 2);
check("E · 2 escudos no cubren 3 días: racha 1", end(E).streak === 1);
check("E · escudos agotados", end(E).shields === 0);

// F: dos siestas de 2h en el mismo día de sueño completan el día (4h)
const F = runTimeline([[], [[7, 9]], [[7, 9]], [[7, 9], [13, 2], [17, 2]], [[7, 8]]]);
check("F · 2h + 2h = 4h completan el día", at(F, 4).streak === 4);
check("F · la noche de ese día ya no suma", end(F).streak === 4);

// G: dormirse a distintas horas no pierde días (fin de semana aluvial)
const G = runTimeline([[], [[7, 9]], [[1, 8]], [[7, 8]], [[1, 8]]]);
check("G · noches a 07:00 y 01:00: racha 4", end(G).streak === 4);

console.log(failures === 0 ? "\nTODO OK" : `\n${failures} FALLOS`);
process.exit(failures === 0 ? 0 : 1);
