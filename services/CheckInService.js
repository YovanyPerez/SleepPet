// Daily Check-in + análisis "Sleep & Study" (puro, sin React Native).
//
// Representa únicamente la percepción reportada por el usuario; no es una
// medición médica ni una medición objetiva de rendimiento académico.
// Los análisis son descriptivos (patrones observados), nunca causales.
//
// Formato de un check-in:
//   { dateKey: "YYYY-MM-DD", energy: "good", studyExperience: "productive", updatedAt: <ms> }
//
// Invariantes:
// - Máximo 1 check-in por dateKey (upsert, no duplica).
// - Datos corruptos ignorados de forma segura (sin lanzar).
// - Sin divisiones por cero ni NaN.

export const ENERGY_LEVELS = ["tired", "low", "okay", "good", "energetic"];
export const STUDY_LEVELS = ["difficult", "normal", "good", "productive"];

const ENERGY_ORDER = {
  tired: 1,
  low: 2,
  okay: 3,
  good: 4,
  energetic: 5,
};

// Umbrales de "suficiencia" por nº de días con check-in (tunables).
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

function isValidCheckIn(entry) {
  return (
    entry &&
    typeof entry === "object" &&
    isValidDateKey(entry.dateKey) &&
    isValidEnergy(entry.energy) &&
    isValidStudy(entry.studyExperience)
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

  if (!isValidCheckIn(entry)) {
    return dedupByDateKey(base);
  }

  const stamped = {
    dateKey: entry.dateKey,
    energy: entry.energy,
    studyExperience: entry.studyExperience,
    updatedAt:
      typeof entry.updatedAt === "number" ? entry.updatedAt : Date.now(),
  };

  const rest = dedupByDateKey(base).filter(
    (c) => c.dateKey !== stamped.dateKey
  );

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
  const checkInCount = validCheckIns.length;

  const energyDistribution = {
    tired: 0,
    low: 0,
    okay: 0,
    good: 0,
    energetic: 0,
  };
  let energySum = 0;
  for (const c of validCheckIns) {
    energyDistribution[c.energy]++;
    energySum += ENERGY_ORDER[c.energy];
  }
  const avgEnergy = checkInCount > 0 ? energySum / checkInCount : null;

  const studyDistribution = {
    difficult: 0,
    normal: 0,
    good: 0,
    productive: 0,
  };
  for (const c of validCheckIns) {
    studyDistribution[c.studyExperience]++;
  }

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

  // Relación sueño ↔ energía: solo días con check-in Y horas de sueño.
  const lowKeys = new Set(["tired", "low"]);
  let lowSum = 0;
  let lowCount = 0;
  let highSum = 0;
  let highCount = 0;
  for (const c of validCheckIns) {
    const h = dayHours.get(c.dateKey);
    if (typeof h !== "number") continue;
    if (lowKeys.has(c.energy)) {
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
    avgSleepHours,
    consistency,
    sleepEnergyRelation,
  };
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
