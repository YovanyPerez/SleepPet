// Harness para Daily Check-in + análisis "Sleep & Study" (CheckInService).
// Uso: node tools/testCheckIn.js
// Puro, sin React Native.

import {
  upsertCheckIn,
  getCheckInByDate,
  analyzeSleepStudy,
  buildSleepStudyObservation,
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

// 7. Relación sueño/despertar (usa wake, no energy nocturna)
const hist = [
  S("2026-09-01", 8),
  S("2026-09-02", 6),
  S("2026-09-03", 7.5),
  S("2026-09-04", 5),
];
const relChecks = [
  { dateKey: "2026-09-01", wake: "fresh", updatedAt: 1 },
  { dateKey: "2026-09-02", wake: "groggy", updatedAt: 2 },
  { dateKey: "2026-09-03", wake: "rested", updatedAt: 3 },
  { dateKey: "2026-09-04", wake: "groggy", updatedAt: 4 },
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

// 11. Energía y estudio pueden registrarse por separado en el mismo día
let partial = upsertCheckIn([], {
  dateKey: "2026-09-20",
  studyExperience: "good",
  updatedAt: 1,
});
check(
  "respuesta de estudio sola se guarda",
  partial.length === 1 && partial[0].studyExperience === "good" && !partial[0].energy
);
partial = upsertCheckIn(partial, {
  dateKey: "2026-09-20",
  energy: "okay",
  updatedAt: 2,
});
check(
  "respuesta de energía se combina sin borrar estudio",
  partial.length === 1 &&
    partial[0].energy === "okay" &&
    partial[0].studyExperience === "good"
);
partial = upsertCheckIn(partial, {
  dateKey: "2026-09-20",
  studyExperience: "productive",
  updatedAt: 3,
});
check(
  "actualizar estudio conserva energía",
  partial.length === 1 &&
    partial[0].energy === "okay" &&
    partial[0].studyExperience === "productive"
);

const splitRecords = [
  D("2026-10-01", "good", undefined),
  D("2026-10-02", "okay", undefined),
  { dateKey: "2026-10-03", studyExperience: "productive", updatedAt: 1 },
];
const splitAnalysis = analyzeSleepStudy({ sleepHistory: [], checkIns: splitRecords });
check(
  "suficiencia de estudio cuenta solo respuestas de estudio",
  splitAnalysis.checkInCount === 1 && splitAnalysis.tier === "none"
);
check(
  "promedio de energía incluye registros parciales",
  Math.abs(splitAnalysis.avgEnergy - 3.5) < 1e-9
);
check(
  "distribución de estudio incluye registros parciales",
  splitAnalysis.studyDistribution.productive === 1
);

// 12. Despertar (wake): escala nueva, se combina sin pisar noche
let wake = upsertCheckIn([], {
  dateKey: "2026-09-21",
  wake: "fresh",
  updatedAt: 1,
});
check(
  "wake solo se guarda",
  wake.length === 1 && wake[0].wake === "fresh" && !wake[0].energy
);
wake = upsertCheckIn(wake, {
  dateKey: "2026-09-21",
  energy: "tired",
  studyExperience: "good",
  updatedAt: 2,
});
check(
  "noche se combina sin borrar wake",
  wake.length === 1 &&
    wake[0].wake === "fresh" &&
    wake[0].energy === "tired" &&
    wake[0].studyExperience === "good"
);
const wakeBad = upsertCheckIn([], { dateKey: "2026-09-22", wake: "INVALIDO" });
check("wake inválido no se guarda", wakeBad.length === 0);

// 13. Relación sueño↔despertar usa wake (no energy nocturna)
const wakeHist = [
  S("2026-09-01", 8),
  S("2026-09-02", 5),
  S("2026-09-03", 7.5),
  S("2026-09-04", 5.5),
];
const wakeChecks = [
  { dateKey: "2026-09-01", wake: "fresh", updatedAt: 1 },
  { dateKey: "2026-09-02", wake: "groggy", updatedAt: 2 },
  { dateKey: "2026-09-03", wake: "rested", updatedAt: 3 },
  { dateKey: "2026-09-04", wake: "groggy", updatedAt: 4 },
];
const wakeRel = analyzeSleepStudy({ sleepHistory: wakeHist, checkIns: wakeChecks }).sleepEnergyRelation;
check("relación wake presente", wakeRel !== null);
check("wake alta energía > baja", wakeRel.highEnergyAvgHours > wakeRel.lowEnergyAvgHours);
const energyOnlyChecks = [
  D("2026-09-01", "energetic", "good"),
  D("2026-09-02", "tired", "normal"),
  D("2026-09-03", "energetic", "good"),
  D("2026-09-04", "tired", "normal"),
];
const energyOnlyRel = analyzeSleepStudy({ sleepHistory: hist, checkIns: energyOnlyChecks }).sleepEnergyRelation;
check("energy nocturna sola no genera relación", energyOnlyRel === null);

// 14. Observaciones (puras, una sola con prioridad)
const baseStudy = {
  checkInCount: 5,
  tier: "early",
  avgEnergy: null,
  energyDistribution: { tired: 0, low: 0, okay: 0, good: 0, energetic: 0 },
  studyDistribution: { difficult: 0, normal: 3, good: 0, productive: 0 },
  wakeDistribution: { groggy: 0, okay: 0, rested: 0, fresh: 0 },
  avgWake: null,
  wakeCount: 0,
  avgSleepHours: 7.5,
  consistency: 2,
  sleepEnergyRelation: null,
};
check("sin señales → null", buildSleepStudyObservation(baseStudy, 8) === null);
check(
  "consistente solo → consistent",
  buildSleepStudyObservation({ ...baseStudy, consistency: 0.5 }, 8) === "consistent"
);
check(
  "mañanas pesadas",
  buildSleepStudyObservation({
    ...baseStudy,
    wakeDistribution: { groggy: 2, okay: 1, rested: 1, fresh: 0 },
    wakeCount: 4,
  }, 8) === "heavyMornings"
);
check(
  "estudio productivo + consistente",
  buildSleepStudyObservation({
    ...baseStudy,
    studyDistribution: { difficult: 0, normal: 0, good: 1, productive: 3 },
    consistency: 0.5,
  }, 8) === "studyConsistent"
);
check(
  "promedio bajo meta",
  buildSleepStudyObservation({ ...baseStudy, avgSleepHours: 5.5 }, 8) === "belowGoal"
);
check(
  "promedio cerca de meta → null",
  buildSleepStudyObservation({ ...baseStudy, avgSleepHours: 7.5 }, 8) === null
);
check(
  "prioridad: pesadas gana a estudio",
  buildSleepStudyObservation({
    ...baseStudy,
    wakeDistribution: { groggy: 2, okay: 1, rested: 1, fresh: 0 },
    wakeCount: 4,
    studyDistribution: { difficult: 0, normal: 0, good: 1, productive: 3 },
    consistency: 0.5,
  }, 8) === "heavyMornings"
);
check(
  "prioridad: existente gana (betterEnergy)",
  buildSleepStudyObservation({
    ...baseStudy,
    sleepEnergyRelation: { lowEnergyAvgHours: 5, highEnergyAvgHours: 7 },
    consistency: 2,
    wakeDistribution: { groggy: 2, okay: 1, rested: 1, fresh: 0 },
    wakeCount: 4,
  }, 8) === "betterEnergy"
);

const total = 43;
console.log(
  failures === 0
    ? `=== ${total}/${total} OK ===`
    : `=== ${total - failures}/${total} OK, ${failures} FAIL ===`
);
process.exit(failures === 0 ? 0 : 1);
