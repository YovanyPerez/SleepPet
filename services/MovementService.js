import { NativeModules } from "react-native";

const { MovementModule } = NativeModules;

// Fallback seguro si el módulo nativo no está (build viejo o módulo no registrado)
const EMPTY_SUMMARY = { events: 0, score: 0, epochs: [], smartWindows: [], smartWindowMs: 30000 };

function normalizeSmartWindow(w) {
  return {
    startTime: typeof w?.startTime === "number" ? w.startTime : 0,
    durationMs: typeof w?.durationMs === "number" ? w.durationMs : 0,
    avgMovement: typeof w?.avgMovement === "number" ? w.avgMovement : 0,
    maxMovement: typeof w?.maxMovement === "number" ? w.maxMovement : 0,
    avgExcess: typeof w?.avgExcess === "number" ? w.avgExcess : 0,
    samples: typeof w?.samples === "number" ? w.samples : 0,
    audioRms: typeof w?.audioRms === "number" ? w.audioRms : 0,
    audioZcr: typeof w?.audioZcr === "number" ? w.audioZcr : 0,
    audioSamples: typeof w?.audioSamples === "number" ? w.audioSamples : 0,
    hasAudio: typeof w?.hasAudio === "boolean" ? w.hasAudio : false,
    level: typeof w?.level === "string" ? w.level : "LOW",
    stage: typeof w?.stage === "string" ? w.stage : "LIGHT",
    rawStage: typeof w?.rawStage === "string" ? w.rawStage : "LIGHT",
    confidence: typeof w?.confidence === "number" ? w.confidence : 0.5,
  };
}

function normalizeSummary(raw) {
  return {
    events: typeof raw?.events === "number" ? raw.events : 0,
    score: typeof raw?.score === "number" ? raw.score : 0,
    epochs: Array.isArray(raw?.epochs) ? raw.epochs : [],
    smartWindows: Array.isArray(raw?.smartWindows) ? raw.smartWindows.map(normalizeSmartWindow) : [],
    smartWindowMs: typeof raw?.smartWindowMs === "number" ? raw.smartWindowMs : 30000,
  };
}

/**
 * Resumen de movimiento de la sesión activa (desde el detector nativo del
 * SleepForegroundService). No muta el estado del detector; los epochs
 * vienen agregados en ventanas de 5 min.
 */
export async function getMovementSummary() {
  if (!MovementModule?.getMovementSummary) {
    console.log("MovementModule no disponible — sin datos de movimiento");
    return { ...EMPTY_SUMMARY };
  }
  try {
    const raw = await MovementModule.getMovementSummary();
    return normalizeSummary(raw);
  } catch (e) {
    console.log("Movement: error leyendo resumen:", e?.message ?? e);
    return { ...EMPTY_SUMMARY };
  }
}

/**
 * Limpia el resumen nativo. Debe llamarse después de guardar los datos
 * en sleep_history (y también cuando la sesión se descarta) para que
 * nunca se mezclen datos entre sesiones.
 */
export function clearMovementSummary() {
  if (!MovementModule?.clearMovementSummary) return;
  try {
    MovementModule.clearMovementSummary();
  } catch (e) {
    console.log("Movement: error limpiando resumen:", e?.message ?? e);
  }
}

/**
 * Etiqueta de presentación a partir del score (solo texto para la UI).
 * Espejo de los umbrales de etiqueta del detector nativo (SCORE_LOW 0.12,
 * SCORE_HIGH 0.30); los números reales siempre se calculan en nativo.
 * No es una clasificación clínica.
 */
export function movementLevel(score, t) {
  if (typeof score !== "number") return null;
  if (score < 0.12) return t.movementLow;
  if (score < 0.3) return t.movementMedium;
  return t.movementHigh;
}
