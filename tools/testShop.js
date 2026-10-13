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
  daysMissedBetween,
} from "../services/StreakService.js";

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

// 3. Escudo de racha: hueco de un día
const base = {
  currentStreak: 5,
  lastStreakDateKey: "2026-09-10",
  sessionEnd: new Date(2026, 8, 12, 8, 0, 0),
  hoursSlept: 7,
};

// 2026-09-10 -> 12: solo se saltó el 11, hoy se está contando
check("base: 1 día perdido", daysMissedBetween("2026-09-10", "2026-09-12") === 1);

const withShield = computeStreakUpdate({ ...base, shields: 2 });
check("hueco con escudo: racha continúa", withShield.streak === 6);
check("hueco con escudo: consume 1", withShield.shields === 1);
check("hueco con escudo: fecha estampada", withShield.lastStreakDateKey === "2026-09-12");

const noShield = computeStreakUpdate({ ...base, shields: 0 });
check("hueco sin escudo: racha reinicia", noShield.streak === 1);
check("hueco sin escudo: no toca escudos", noShield.shields === 0);

// 3b. Hueco de varios días: cada día perdido cuesta su escudo
// (10 -> 16 = 5 días perdidos: 11,12,13,14,15)
const longGap = {
  currentStreak: 5,
  lastStreakDateKey: "2026-09-10",
  sessionEnd: new Date(2026, 8, 16, 8, 0, 0),
  hoursSlept: 7,
};
check("hueco largo: 5 días perdidos", daysMissedBetween("2026-09-10", "2026-09-16") === 5);

const longWithOne = computeStreakUpdate({ ...longGap, shields: 1 });
check("5 días de hueco con 1 escudo: reinicia", longWithOne.streak === 1);
check("5 días de hueco con 1 escudo: escudos agotados", longWithOne.shields === 0);

const longWithFive = computeStreakUpdate({ ...longGap, shields: 5 });
check("5 días de hueco con 5 escudos: racha continúa", longWithFive.streak === 6);
check("5 días de hueco con 5 escudos: consume 5", longWithFive.shields === 0);

// 4. Escudo intacto cuando no hace falta
const consecutive = computeStreakUpdate({
  currentStreak: 5,
  lastStreakDateKey: "2026-09-11",
  sessionEnd: new Date(2026, 8, 12, 8, 0, 0),
  hoursSlept: 7,
  shields: 2,
});
check("día consecutivo: +1", consecutive.streak === 6);
check("día consecutivo: escudo intacto", consecutive.shields === 2);

const sameDay = computeStreakUpdate({
  currentStreak: 5,
  lastStreakDateKey: "2026-09-12",
  sessionEnd: new Date(2026, 8, 12, 8, 0, 0),
  hoursSlept: 7,
  shields: 2,
});
check("mismo día: racha igual", sameDay.streak === 5);
check("mismo día: escudo intacto", sameDay.shields === 2);

const nap = computeStreakUpdate({
  currentStreak: 5,
  lastStreakDateKey: "2026-09-10",
  sessionEnd: new Date(2026, 8, 12, 8, 0, 0),
  hoursSlept: 2,
  shields: 1,
});
check("siesta: neutra", nap.streak === 5 && nap.lastStreakDateKey === "2026-09-10");
check("siesta: no consume escudo", nap.shields === 1);

// 5. Compatibilidad: sin parámetro shields no explota
const legacy = computeStreakUpdate({
  currentStreak: 5,
  lastStreakDateKey: "2026-09-11",
  sessionEnd: new Date(2026, 8, 12, 8, 0, 0),
  hoursSlept: 7,
});
check("legacy sin shields: +1", legacy.streak === 6);
check("legacy sin shields: shields 0", legacy.shields === 0);

// 6. Liquidación al abrir la app (días sin usar): la racha no puede
// quedar congelada. Un escudo por día perdido, igual que finishSleep.
// 2026-09-10 -> 15 = 4 días perdidos (11,12,13,14)
const dead = settleStreakOnLoad({
  streak: 5,
  lastStreakDateKey: "2026-09-10",
  shields: 1,
  todayKey: "2026-09-15",
});
check("4 días perdidos con 1 escudo: racha a 0", dead.streak === 0);
check("4 días perdidos con 1 escudo: escudos a 0", dead.shields === 0);
check("4 días perdidos con 1 escudo: marca cambio", dead.changed === true);

const covered = settleStreakOnLoad({
  streak: 5,
  lastStreakDateKey: "2026-09-10",
  shields: 4,
  todayKey: "2026-09-15",
});
check("4 días perdidos con 4 escudos: no cambia", covered.streak === 5);
check("4 días perdidos con 4 escudos: escudos intactos", covered.shields === 4);
check("4 días perdidos con 4 escudos: sin cambio", covered.changed === false);

const yesterday = settleStreakOnLoad({
  streak: 5,
  lastStreakDateKey: "2026-09-14",
  shields: 0,
  todayKey: "2026-09-15",
});
check("dormido ayer: intacto", yesterday.streak === 5 && yesterday.changed === false);

const today = settleStreakOnLoad({
  streak: 5,
  lastStreakDateKey: "2026-09-15",
  shields: 0,
  todayKey: "2026-09-15",
});
check("ya contado hoy: intacto", today.streak === 5 && today.changed === false);

const noKey = settleStreakOnLoad({
  streak: 0,
  lastStreakDateKey: null,
  shields: 0,
  todayKey: "2026-09-15",
});
check("sin sello previo: intacto", noKey.streak === 0 && noKey.changed === false);

const alreadyZero = settleStreakOnLoad({
  streak: 0,
  lastStreakDateKey: "2026-09-01",
  shields: 0,
  todayKey: "2026-09-15",
});
check("racha ya en 0: no marca cambio", alreadyZero.changed === false);

// 6b. Cruce de mes/año
check("fin de mes: 1 día perdido", daysMissedBetween("2026-01-31", "2026-02-02") === 1);
check("fin de año: hoy es el sello, 0 perdidos", daysMissedBetween("2025-12-31", "2026-01-01") === 0);
check("año nuevo: 30 y 31 perdidos", daysMissedBetween("2025-12-29", "2026-01-01") === 2);
check("mismo día: 0 perdidos", daysMissedBetween("2026-09-15", "2026-09-15") === 0);
check("clave inválida: 0 perdidos", daysMissedBetween("basura", "2026-09-15") === 0);
check("clave futura: 0 perdidos", daysMissedBetween("2026-09-20", "2026-09-15") === 0);

console.log(failures === 0 ? "\nTODO OK" : `\n${failures} FALLOS`);
process.exit(failures === 0 ? 0 : 1);
