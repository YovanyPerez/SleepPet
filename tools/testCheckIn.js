// Harness para Daily Check-in + análisis "Sleep & Study" (CheckInService).
// Uso: node tools/testCheckIn.js
// Puro, sin React Native.

import {
  upsertCheckIn,
  getCheckInByDate,
  analyzeSleepStudy,
  energyLevelFromAverage,
  mostCommonStudy,
  ENERGY_LEVELS,
  STUDY_LEVELS,
} from "../services/CheckInService.js";

let failures = 0;
function check(name, cond) {
  console.log(`${cond ? "OK  " : "FAIL"} | ${name}`);
  if (!cond) failures++;
}

const D = (dateKey, energy, studyExperience, updatedAt = 0) => ({
  dateKey,
  energy,
  studyExperience,
  updatedAt,
});

const S = (dateKey, hours) => ({ dateKey, hours });

// 1. Sin check-ins
check("sin check-ins → tier none", analyzeSleepStudy({ sleepHistory: [], checkIns: [] }).tier === "none");
check("sin check-ins → count 0", analyzeSleepStudy({ sleepHistory: [], checkIns: [] }).checkInCount === 0);
check("sin check-ins → avgEnergy null", analyzeSleepStudy({ sleepHistory: [], checkIns: [] }).avgEnergy === null);

// 2. Un check-in
let list = [];
list = upsertCheckIn(list, D("2026-09-10", "good", "productive", 1));
check("un check-in → count 1", list.length === 1);
check("un check-in → recuperable", getCheckInByDate(list, "2026-09-10")?.energy === "good");

// 3. Múltiples check-ins
list = upsertCheckIn(list, D("2026-09-11", "energetic", "normal", 2));
list = upsertCheckIn(list, D("2026-09-12", "okay", "good", 3));
check("múltiples → count 3", list.length === 3);

// 4. Días sin check-in
check("día sin check-in → null", getCheckInByDate(list, "2026-09-13") === null);

// 5. Promedio de energía: good(4) + energetic(5) + okay(3) = 4.0
const avg = analyzeSleepStudy({ sleepHistory: [], checkIns: list }).avgEnergy;
check("promedio de energía = 4.0", Math.abs(avg - 4.0) < 1e-9);
check("energyLevelFromAverage(4.0) → good", energyLevelFromAverage(4.0) === "good");

// 6. Distribución de study experience
const dist = analyzeSleepStudy({ sleepHistory: [], checkIns: list }).studyDistribution;
check("distribución estudio: good=1", dist.good === 1);
check("distribución estudio: productive=1", dist.productive === 1);
check("distribución estudio: normal=1", dist.normal === 1);
check("most common study → normal (empate, primero)", mostCommonStudy(dist) === "normal");

// 7. Relación sueño/energía
const hist = [
  S("2026-09-01", 8),
  S("2026-09-02", 6),
  S("2026-09-03", 7.5),
  S("2026-09-04", 5),
];
const relChecks = [
  D("2026-09-01", "energetic", "good"),
  D("2026-09-02", "tired", "normal"),
  D("2026-09-03", "energetic", "good"),
  D("2026-09-04", "tired", "normal"),
];
const rel = analyzeSleepStudy({ sleepHistory: hist, checkIns: relChecks }).sleepEnergyRelation;
check("relación presente", rel !== null);
check("alta energía > baja energía", rel.highEnergyAvgHours > rel.lowEnergyAvgHours);

// 8. Datos insuficientes (2 check-ins → none)
const two = [D("2026-09-01", "good", "good"), D("2026-09-02", "okay", "normal")];
check("2 check-ins → tier none", analyzeSleepStudy({ sleepHistory: [], checkIns: two }).tier === "none");
check("3 check-ins → tier early", analyzeSleepStudy({ sleepHistory: [], checkIns: two.concat(D("2026-09-03", "good", "good")) }).tier === "early");

// 9. Datos corruptos ignorados
const corrupt = [
  null,
  {},
  { dateKey: "no-es-fecha", energy: "good", studyExperience: "good" },
  { dateKey: "2026-09-05", energy: "INVALIDO", studyExperience: "good" },
  { dateKey: "2026-09-06", energy: "good", studyExperience: "INVALIDO" },
];
check("corruptos: upsert no agrega", upsertCheckIn(corrupt, D("2026-09-07", "good", "good")).length === 1);
const corruptHist = [{ dateKey: "2026-09-01", hours: NaN }, { dateKey: "2026-09-02", hours: -3 }, { dateKey: "2026-09-03" }];
const cRes = analyzeSleepStudy({ sleepHistory: corruptHist, checkIns: corrupt });
check("corruptos: avgSleepHours null", cRes.avgSleepHours === null);
check("corruptos: checkInCount 0", cRes.checkInCount === 0);

// 10. Duplicados / upsert (máximo 1 por día)
let dup = [];
dup = upsertCheckIn(dup, D("2026-09-01", "tired", "normal", 1));
dup = upsertCheckIn(dup, D("2026-09-01", "good", "productive", 2));
check("duplicados: un solo registro", dup.length === 1);
check("duplicados: conserva el más reciente", getCheckInByDate(dup, "2026-09-01").energy === "good");
// upsert con entrada inválida no corrompe
dup = upsertCheckIn(dup, { dateKey: "2026-09-01", energy: "bad" });
check("upsert inválido no corrompe", dup.length === 1 && dup[0].energy === "good");

const total = 23;
console.log(
  failures === 0
    ? `=== ${total}/${total} OK ===`
    : `=== ${total - failures}/${total} OK, ${failures} FAIL ===`
);
process.exit(failures === 0 ? 0 : 1);
