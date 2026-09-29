// Harness de métricas sombra PPG (sin React Native).
// Uso: node tools/testPPGDiagnostics.js
import { calculateBPM } from "../services/PPGService.js";

let failures = 0;
let total = 0;
function check(name, condition) {
  total++;
  console.log(`${condition ? "OK  " : "FAIL"} | ${name}`);
  if (!condition) failures++;
}

const fps = 30;
const weakBrightnessSignal = Array.from({ length: fps * 10 }, (_, i) =>
  45 + 5 * Math.sin((2 * Math.PI * 72 * i) / (60 * fps))
);
const regularSignal = Array.from({ length: fps * 10 }, (_, i) =>
  150 + 6 * Math.sin((2 * Math.PI * 72 * i) / (60 * fps))
);

const normalResult = calculateBPM(weakBrightnessSignal, fps);
const shadowResult = calculateBPM(weakBrightnessSignal, fps, { diagnosticOnly: true });
check("el gate normal sigue rechazando brillo bajo", normalResult.error === "no_finger");
check("modo sombra estima BPM aunque el canal tenga brillo bajo", shadowResult.bpm === 72);
check(
  "modo sombra mide AC/DC aunque el gate normal rechace la señal",
  Number.isFinite(shadowResult.pulseIndexPercent) && shadowResult.pulseIndexPercent > 0
);
check(
  "modo sombra mide prominencia espectral aunque el gate normal rechace la señal",
  Number.isFinite(shadowResult.spectralProminence) && shadowResult.spectralProminence > 1
);

const qualityResult = calculateBPM(regularSignal, fps);
check(
  "la toma informa amplitud pulsátil relativa AC/DC",
  Number.isFinite(qualityResult.pulseIndexPercent) &&
    qualityResult.pulseIndexPercent > 1 &&
    qualityResult.pulseIndexPercent < 5
);
check(
  "la toma informa prominencia del pico espectral",
  Number.isFinite(qualityResult.spectralProminence) && qualityResult.spectralProminence > 1
);

console.log(
  failures === 0
    ? `\n${total}/${total} OK`
    : `\n${total - failures}/${total} OK, ${failures} FAIL`
);
process.exit(failures === 0 ? 0 : 1);
