// Harness sintético para regresión de PPGService.calculateBPM
// Uso: node tools/testPPG.js
// Genera senales sintéticas a distintos BPM y compara contra calculateBPM

// Import dinámico ESM/CJS: PPGService usa export ESM, lo cargamos via evaluacion manual
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

// Cargamos PPGService.js como texto y extraemos calculateBPM via import
// Truco simple: usar import ESM directo si Node soporta
let calculateBPM;
try {
  const mod = await import("../services/PPGService.js");
  calculateBPM = mod.calculateBPM;
} catch (e) {
  console.error("No se pudo importar services/PPGService.js:", e.message);
  console.error("Asegurate de ejecutar con: node tools/testPPG.js desde la raiz");
  process.exit(1);
}

const FPS = 30;

// Generador sintético: sinusoide + ruido + drift + escalón AE aislado
function generateSignal({ bpm, durationSec = 10, fps = FPS, noise = 0.6, driftAmp = 0.4, baseline = 150, aeStepAt = -1, aeStepAmp = 8 }) {
  const n = Math.round(durationSec * fps);
  const freq = bpm / 60; // Hz
  const driftFreq = 0.2; // deriva respiratoria lenta
  const arr = new Array(n);
  // ruido pseudo-aleatorio deterministico (LCG simple) para reproducibilidad entre pasos
  let seed = 1337 + bpm;
  function rand() {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff - 0.5;
  }
  for (let i = 0; i < n; i++) {
    const t = i / fps;
    const cardiac = Math.sin(2 * Math.PI * freq * t);
    const drift = driftAmp * Math.sin(2 * Math.PI * driftFreq * t);
    const nse = noise * rand();
    let v = baseline + 6 * cardiac + drift + nse;
    if (aeStepAt >= 0 && i >= aeStepAt) v += aeStepAmp;
    arr[i] = v;
  }
  return arr;
}

function runCase({ bpm, ...opts }) {
  const signal = generateSignal({ bpm, ...opts });
  const res = calculateBPM(signal, FPS);
  const ok = res.bpm != null && Math.abs(res.bpm - bpm) <= 3;
  const status = ok ? "OK" : "FAIL";
  console.log(
    `${status} | esperado ${String(bpm).padStart(3)} lpm | obtenido ${String(res.bpm ?? "-").padStart(3)} | conf=${(res.confidence ?? 0).toFixed(2)} | esp=${res.spectralBpm != null ? String(res.spectralBpm).padStart(5) : "    -"} delta=${res.spectralDelta != null ? res.spectralDelta.toFixed(1).padStart(4) : "   -"} | err=${res.error ?? "null"} | picos=${res.peaks ?? "-"} | opts=${JSON.stringify(opts)}`
  );
  return ok;
}

console.log("=== Harness PPG — regresion entre pasos ===\n");

let total = 0;
let passed = 0;

function test(label, cases) {
  console.log(`\n-- ${label} --`);
  for (const c of cases) {
    total++;
    if (runCase(c)) passed++;
  }
}

// Casos base: rango fisiológico
test("BPM base (10s, ruido medio)", [
  { bpm: 60 }, { bpm: 72 }, { bpm: 80 }, { bpm: 100 }, { bpm: 120 }, { bpm: 140 },
]);

// Ruido alto
test("Ruido alto (noise=1.2)", [
  { bpm: 72, noise: 1.2 }, { bpm: 100, noise: 1.2 },
]);

// Con escalón AE (simula salto de auto-exposicion)
test("Escalon AE a mitad (aeStepAt=150)", [
  { bpm: 75, aeStepAt: 150, aeStepAmp: 10 },
  { bpm: 90, aeStepAt: 150, aeStepAmp: 10 },
]);

// Señales que deben fallar (validacion)
test("Casos que deben fallar (sin dedo / senal plana)", [
  { bpm: 75, baseline: 40 }, // avg <80 -> no_finger
  { bpm: 75, noise: 0.05, driftAmp: 0 }, // std muy bajo -> low_signal (ajustar si no dispara)
]);

// Duración corta
test("Duracion corta (4s -> too_short)", [
  { bpm: 75, durationSec: 4 },
]);

console.log(`\n=== Resumen: ${passed}/${total} OK ===`);
if (passed < total) {
  console.log("(algunos FAIL son esperados en casos 'deben fallar'; revisa err=no_finger/low_signal/too_short)");
}
