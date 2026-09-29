// Harness backfill WAKE del historial (ventanas con desbloqueo => WAKE)
// Uso: node tools/testWakeBackfill.js
import { backfillWakeFromUnlocks } from "../services/WakeBackfillService.js";

let failures = 0;
function check(name, cond) {
  console.log(`${cond ? "OK  " : "FAIL"} | ${name}`);
  if (!cond) failures++;
}

const W = (start, stage = "LIGHT") => ({ startTime: start, durationMs: 30000, stage, rawStage: stage, confidence: 0.5 });
const T0 = 1700000000000;

// 1. Ventana con desbloqueo dentro => WAKE, resto intacto
let r = backfillWakeFromUnlocks([
  { smartWindows: [W(T0), W(T0 + 30000), W(T0 + 60000)], smartWindowMs: 30000, unlockTimes: [T0 + 40000] },
]);
check("cambia algo (changed)", r.changed === true);
check("ventana del desbloqueo => WAKE", r.history[0].smartWindows[1].stage === "WAKE");
check("ventana previa lejana queda LIGHT", r.history[0].smartWindows[0].stage === "LIGHT");
check("rawStage original intacto", r.history[0].smartWindows[1].rawStage === "LIGHT");
check("confidence sube a 0.9", r.history[0].smartWindows[1].confidence === 0.9);

// 2. Gracia 90s: desbloqueo 60s antes del fin de la ventana cuenta
r = backfillWakeFromUnlocks([
  { smartWindows: [W(T0 + 120000)], smartWindowMs: 30000, unlockTimes: [T0 + 90000] },
]);
check("gracia 90s marca WAKE", r.history[0].smartWindows[0].stage === "WAKE");

// 3. Desbloqueo 5 min antes ya no alcanza
r = backfillWakeFromUnlocks([
  { smartWindows: [W(T0 + 600000)], smartWindowMs: 30000, unlockTimes: [T0] },
]);
check("fuera de gracia queda LIGHT y changed=false", r.history[0].smartWindows[0].stage === "LIGHT" && r.changed === false);

// 4. Sin unlockTimes no toca nada
r = backfillWakeFromUnlocks([{ smartWindows: [W(T0)], smartWindowMs: 30000, unlockTimes: [] }]);
check("sin desbloqueos no cambia", r.changed === false);

// 5. estimatedStages se recalcula (desbloqueo solo en la última ventana)
r = backfillWakeFromUnlocks([
  { smartWindows: [W(T0), W(T0 + 30000), W(T0 + 60000), W(T0 + 90000)], smartWindowMs: 30000, estimatedStages: { wake: 0, light: 2, deep: 0, totalWindows: 4, hasAudio: false }, unlockTimes: [T0 + 115000] },
]);
check("estimatedStages.wake=1 (mismo redondeo toMin que finishSleep)", r.history[0].estimatedStages.wake === 1 && r.history[0].estimatedStages.totalWindows === 4);

// 6. Ventanas ya WAKE y sesiones sin smartWindows se ignoran
r = backfillWakeFromUnlocks([
  { smartWindows: [W(T0, "WAKE")], smartWindowMs: 30000, unlockTimes: [T0 + 1000] },
  { hours: 5, unlockTimes: [T0] },
]);
check("lo ya correcto no se reescribe", r.changed === false);

const TOTAL = 10;
console.log(failures === 0 ? `=== ${TOTAL}/${TOTAL} OK ===` : `=== ${TOTAL - failures}/${TOTAL} OK, ${failures} FAIL ===`);
process.exit(failures === 0 ? 0 : 1);
