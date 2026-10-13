// Daily Check-in + análisis "Sleep & Study" (puro, sin React Native).
//
// Representa únicamente la percepción reportada por el usuario; no es una
// medición médica ni una medición objetiva de rendimiento académico.
// Los análisis son descriptivos (patrones observados), nunca causales.
//
// Formato de un registro diario (energía y estudio se contestan por separado;
// al despertar se añade `wake` con escala propia):
//   { dateKey: "YYYY-MM-DD", energy?: "good", studyExperience?: "productive", wake?: "rested", updatedAt: <ms> }
//
// Invariantes:
// - Máximo 1 registro por dateKey; cada respuesta parcial se combina con la existente.
// - Datos corruptos ignorados de forma segura (sin lanzar).
// - Sin divisiones por cero ni NaN.

export const ENERGY_LEVELS = ["tired", "low", "okay", "good", "energetic"];
export const STUDY_LEVELS = ["difficult", "normal", "good", "productive"];
export const WAKE_LEVELS = ["groggy", "okay", "rested", "fresh"];

const ENERGY_ORDER = {
  tired: 1,
  low: 2,
  okay: 3,
  good: 4,
  energetic: 5,
};

// Orden de la escala al despertar (para promedios y relación con el sueño).
const WAKE_ORDER = {
  groggy: 1,
  okay: 2,
  rested: 3,
  fresh: 4,
};

// Umbrales de "suficiencia" por días con respuesta de estudio (tunables).
const TIER_WEEKLY_MIN = 7;
const TIER_EARLY_MIN = 3;

function isValidDateKey(key) {
  return typeof key === "string" && /^\d{4}-\d{2}-\d{2}$/.test(key);
}

function isValidEnergy(v) {
  return typeof v === "string" && ENERGY_LEVELS.includes(v);
}

function isValidStudy(v) {
  return typeof v === "string" && STUDY_LEVELS.includes(v);
}

function isValidWake(v) {
  return typeof v === "string" && WAKE_LEVELS.includes(v);
}

function isValidCheckIn(entry) {
  return (
    entry &&
    typeof entry === "object" &&
    isValidDateKey(entry.dateKey) &&
    (entry.energy == null || isValidEnergy(entry.energy)) &&
    (entry.studyExperience == null || isValidStudy(entry.studyExperience)) &&
    (entry.wake == null || isValidWake(entry.wake)) &&
    (isValidEnergy(entry.energy) ||
      isValidStudy(entry.studyExperience) ||
      isValidWake(entry.wake))
  );
}

// Elimina duplicados conservando el más reciente (updatedAt).
function dedupByDateKey(list) {
  const map = new Map();
  for (const c of list) {
    if (!isValidCheckIn(c)) continue;
    const prev = map.get(c.dateKey);
    if (!prev || (c.updatedAt ?? 0) >= (prev.updatedAt ?? 0)) {
      map.set(c.dateKey, c);
    }
  }
  return Array.from(map.values());
}

export function upsertCheckIn(list, entry) {
  const base = Array.isArray(list) ? list : [];
  const canonical = dedupByDateKey(base);

  if (!isValidCheckIn(entry)) {
    return canonical;
  }

  const previous = canonical.find((c) => c.dateKey === entry.dateKey);
  const energy = isValidEnergy(entry.energy)
    ? entry.energy
    : previous?.energy;
  const studyExperience = isValidStudy(entry.studyExperience)
    ? entry.studyExperience
    : previous?.studyExperience;
  const wake = isValidWake(entry.wake) ? entry.wake : previous?.wake;

  const stamped = {
    dateKey: entry.dateKey,
    ...(energy ? { energy } : {}),
    ...(studyExperience ? { studyExperience } : {}),
    ...(wake ? { wake } : {}),
    updatedAt:
      typeof entry.updatedAt === "number" ? entry.updatedAt : Date.now(),
  };

  const rest = canonical.filter((c) => c.dateKey !== stamped.dateKey);

  return [stamped, ...rest];
}

export function getCheckInByDate(list, dateKey) {
  if (!Array.isArray(list)) return null;
  const found = list.find(
    (c) => isValidCheckIn(c) && c.dateKey === dateKey
  );
  return found ?? null;
}

export function analyzeSleepStudy({ sleepHistory = [], checkIns = [] } = {}) {
  const validCheckIns = dedupByDateKey(
    Array.isArray(checkIns) ? checkIns : []
  );
  const energyCheckIns = validCheckIns.filter((c) => isValidEnergy(c.energy));
  const studyCheckIns = validCheckIns.filter((c) =>
    isValidStudy(c.studyExperience)
  );
  const checkInCount = studyCheckIns.length;

  const energyDistribution = {
    tired: 0,
    low: 0,
    okay: 0,
    good: 0,
    energetic: 0,
  };
  let energySum = 0;
  for (const c of energyCheckIns) {
    energyDistribution[c.energy]++;
    energySum += ENERGY_ORDER[c.energy];
  }
  const avgEnergy = energyCheckIns.length > 0
    ? energySum / energyCheckIns.length
    : null;

  const studyDistribution = {
    difficult: 0,
    normal: 0,
    good: 0,
    productive: 0,
  };
  for (const c of studyCheckIns) {
    studyDistribution[c.studyExperience]++;
  }

  // Despertar: escala propia; la relación sueño↔energía usa `wake`
  // (se fecha con la mañana = mismo dateKey que la sesión).
  const wakeCheckIns = validCheckIns.filter((c) => isValidWake(c.wake));
  const wakeDistribution = {
    groggy: 0,
    okay: 0,
    rested: 0,
    fresh: 0,
  };
  let wakeSum = 0;
  for (const c of wakeCheckIns) {
    wakeDistribution[c.wake]++;
    wakeSum += WAKE_ORDER[c.wake];
  }
  const avgWake =
    wakeCheckIns.length > 0 ? wakeSum / wakeCheckIns.length : null;

  // Horas de sueño: sesiones válidas; por día se suman (misma clave que el
  // gráfico semanal). Consistente con StatisticsScreen (incluye todas).
  const sessions = Array.isArray(sleepHistory) ? sleepHistory : [];
  const dayHours = new Map();
  const hourList = [];
  for (const s of sessions) {
    if (
      !s ||
      typeof s.hours !== "number" ||
      !isFinite(s.hours) ||
      s.hours <= 0
    ) {
      continue;
    }
    hourList.push(s.hours);
    if (isValidDateKey(s.dateKey)) {
      dayHours.set(s.dateKey, (dayHours.get(s.dateKey) ?? 0) + s.hours);
    }
  }

  const avgSleepHours =
    hourList.length > 0
      ? hourList.reduce((a, b) => a + b, 0) / hourList.length
      : null;

  let consistency = null;
  if (hourList.length >= 2) {
    const mean = avgSleepHours;
    const variance =
      hourList.reduce((a, b) => a + (b - mean) * (b - mean), 0) /
      hourList.length;
    consistency = Math.sqrt(variance);
  }

  // Relación sueño ↔ despertar: solo días con wake Y horas de sueño.
  const lowKeys = new Set(["groggy", "okay"]);
  let lowSum = 0;
  let lowCount = 0;
  let highSum = 0;
  let highCount = 0;
  for (const c of wakeCheckIns) {
    const h = dayHours.get(c.dateKey);
    if (typeof h !== "number") continue;
    if (lowKeys.has(c.wake)) {
      lowSum += h;
      lowCount++;
    } else {
      highSum += h;
      highCount++;
    }
  }
  const pairedDays = lowCount + highCount;
  let sleepEnergyRelation = null;
  if (pairedDays >= 3 && lowCount > 0 && highCount > 0) {
    sleepEnergyRelation = {
      lowEnergyAvgHours: lowSum / lowCount,
      highEnergyAvgHours: highSum / highCount,
    };
  }

  const tier =
    checkInCount >= TIER_WEEKLY_MIN
      ? "weekly"
      : checkInCount >= TIER_EARLY_MIN
        ? "early"
        : "none";

  return {
    checkInCount,
    tier,
    avgEnergy,
    energyDistribution,
    studyDistribution,
    wakeDistribution,
    avgWake,
    wakeCount: wakeCheckIns.length,
    avgSleepHours,
    consistency,
    sleepEnergyRelation,
  };
}

// Observación descriptiva única (nunca causal) para "Sleep & Study".
// Pura, sin lanzar con entradas corruptas. Devuelve una clave o null.
// Prioridad: energeticConsistent > betterEnergy > heavyMornings >
// studyConsistent > belowGoal > consistent.
export function buildSleepStudyObservation(study, goalHours) {
  if (!study || typeof study !== "object") return null;

  const rel = study.sleepEnergyRelation;
  const consistency = study.consistency;
  const consistent =
    typeof consistency === "number" &&
    isFinite(consistency) &&
    consistency < 1;

  if (
    rel &&
    typeof rel.highEnergyAvgHours === "number" &&
    typeof rel.lowEnergyAvgHours === "number" &&
    rel.highEnergyAvgHours > rel.lowEnergyAvgHours + 0.5
  ) {
    if (consistent) return "energeticConsistent";
    return "betterEnergy";
  }

  const wd = study.wakeDistribution;
  const wakeCount = study.wakeCount;
  if (wd && typeof wakeCount === "number" && wakeCount >= 3) {
    const low = (wd.groggy ?? 0) + (wd.okay ?? 0);
    if (low / wakeCount >= 0.6) return "heavyMornings";
  }

  if (consistent) {
    const sd = study.studyDistribution;
    if (sd && (sd.good ?? 0) + (sd.productive ?? 0) > 0) {
      const mc = mostCommonStudy(sd);
      if (mc === "good" || mc === "productive") return "studyConsistent";
    }
  }

  const avg = study.avgSleepHours;
  if (
    typeof avg === "number" &&
    isFinite(avg) &&
    typeof goalHours === "number" &&
    isFinite(goalHours) &&
    goalHours - avg >= 1
  ) {
    return "belowGoal";
  }

  if (consistent) return "consistent";
  return null;
}

// Utilidad de presentación: nivel de energía más cercano al promedio.
export function energyLevelFromAverage(avgEnergy) {
  if (typeof avgEnergy !== "number" || !isFinite(avgEnergy)) return null;
  const idx = Math.max(
    0,
    Math.min(ENERGY_LEVELS.length - 1, Math.round(avgEnergy) - 1)
  );
  return ENERGY_LEVELS[idx];
}

// Nivel de estudio más frecuente (null si no hay datos).
export function mostCommonStudy(studyDistribution) {
  if (!studyDistribution || typeof studyDistribution !== "object") return null;
  let best = null;
  let bestCount = -1;
  for (const key of STUDY_LEVELS) {
    const n = studyDistribution[key] ?? 0;
    if (n > bestCount) {
      bestCount = n;
      best = key;
    }
  }
  return best;
}

// Despertar más frecuente (null si no hay datos).
export function mostCommonWake(wakeDistribution) {
  if (!wakeDistribution || typeof wakeDistribution !== "object") return null;
  let best = null;
  let bestCount = -1;
  for (const key of WAKE_LEVELS) {
    const n = wakeDistribution[key] ?? 0;
    if (n > bestCount) {
      bestCount = n;
      best = key;
    }
  }
  return best;
}
