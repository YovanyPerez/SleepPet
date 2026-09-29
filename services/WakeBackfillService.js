// Backfill WAKE para historial viejo: antes del fix nativo (pantalla/interacción
// => WAKE) las ventanas con uso del celular quedaban LIGHT aunque hubiera
// desbloqueos. Función pura sin RN (testeable con node tools/testWakeBackfill.js).
// Gracia 90s = PHONE_USE_GRACE_MS nativo: ventana [start,end] marca WAKE si hubo
// desbloqueo en [start - GRACE, end]. No toca rawStage (evidencia original).

export const WAKE_BACKFILL_GRACE_MS = 90000;

function toMs(t) {
  if (typeof t === "number") return t;
  const m = Date.parse(t);
  return Number.isFinite(m) ? m : null;
}

export function backfillWakeFromUnlocks(history) {
  if (!Array.isArray(history)) return { history, changed: false };
  let changed = false;
  const out = history.map((s) => {
    const wins = s?.smartWindows;
    const unlocks = s?.unlockTimes;
    if (!Array.isArray(wins) || wins.length === 0 || !Array.isArray(unlocks) || unlocks.length === 0) return s;
    const times = unlocks.map(toMs).filter((m) => m !== null);
    if (times.length === 0) return s;
    const windowMs = typeof s.smartWindowMs === "number" && s.smartWindowMs > 0 ? s.smartWindowMs : 30000;
    let sessionChanged = false;
    const newWins = wins.map((w) => {
      if (w?.stage === "WAKE" || typeof w?.startTime !== "number" || w.startTime <= 0) return w;
      const dur = typeof w.durationMs === "number" && w.durationMs > 0 ? w.durationMs : windowMs;
      const end = w.startTime + dur;
      const hit = times.some((t) => t <= end && end - t <= WAKE_BACKFILL_GRACE_MS && t >= w.startTime - WAKE_BACKFILL_GRACE_MS);
      if (!hit) return w;
      sessionChanged = true;
      return { ...w, stage: "WAKE", confidence: Math.max(typeof w.confidence === "number" ? w.confidence : 0, 0.9) };
    });
    if (!sessionChanged) return s;
    changed = true;
    let wake = 0, light = 0, deep = 0;
    for (const w of newWins) {
      if (w.stage === "WAKE") wake++;
      else if (w.stage === "DEEP") deep++;
      else light++;
    }
    const toMin = (n) => Math.round((n * windowMs) / 60000);
    return {
      ...s,
      smartWindows: newWins,
      estimatedStages: {
        wake: toMin(wake),
        light: toMin(light),
        deep: toMin(deep),
        totalWindows: newWins.length,
        hasAudio: newWins.some((w) => w.hasAudio === true),
      },
    };
  });
  return { history: out, changed };
}
