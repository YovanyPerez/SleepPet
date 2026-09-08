// Cadena de estabilidad PPG: ancla movil + tolerancia a 1 miss aislado
// Extraido de hooks/usePPG para poder probarlo con node (sin RN).
// No toca el gate de dedo (FINGER_MIN/SPATIAL_STD_MAX) ni umbrales de confirmacion.
export const BPM_STABILITY_TOLERANCE = 5;
export const MISS_TOLERANCE = 1;

function medianOf(nums) {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

export function medianBpm(chain) {
  return medianOf(chain.map((x) => x.bpm));
}

export function createStability() {
  return { chain: [], missStreak: 0 };
}

// Lectura valida: exige ±TOL contra ultimo Y contra mediana (ancla movil).
// Salto brusco reinicia la cadena con el nuevo valor.
export function pushReading(state, reading) {
  const chain = state.chain;
  if (!chain.length) return { chain: [reading], missStreak: 0 };
  const last = chain[chain.length - 1];
  const med = medianBpm(chain);
  if (
    Math.abs(reading.bpm - last.bpm) <= BPM_STABILITY_TOLERANCE &&
    Math.abs(reading.bpm - med) <= BPM_STABILITY_TOLERANCE
  ) {
    return { chain: [...chain, reading], missStreak: 0 };
  }
  return { chain: [reading], missStreak: 0 };
}

// Lectura invalida: 1 miss conserva cadena, 2 seguidos la vacian.
export function pushMiss(state) {
  const missStreak = state.missStreak + 1;
  if (missStreak > MISS_TOLERANCE) return { chain: [], missStreak };
  return { chain: state.chain, missStreak };
}
