// Fotopletismografia por camara: senal roja -> BPM
// Logica: pasa-banda Butterworth 2º orden 0.7-4Hz (42-240 bpm) + peak detection + verificador espectral
//
// Filtro: Butterworth pasa-banda 2º orden forward-only (cascada HP 0.7Hz + LP 4Hz)
//   Diseno bilineal (RBJ cookbook) con fs=fps, Q=0.7071 (Butterworth):
//     w0 = 2*pi*fc/fs, alpha = sin(w0)/(2*Q)
//     HP: b0=(1+cos w0)/2, b1=-(1+cos w0), b2=(1+cos w0)/2, a0=1+alpha, a1=-2 cos w0, a2=1-alpha
//     LP: b0=(1-cos w0)/2, b1= 1-cos w0,      b2=(1-cos w0)/2, a0=1+alpha, a1=-2 cos w0, a2=1-alpha
//     Luego normalizar b0,b1,b2,a1,a2 por a0. Ecuacion: y[n]=b0*x[n]+b1*x[n-1]+b2*x[n-2]-a1*y[n-1]-a2*y[n-2]
//   Para fs=30Hz: HP 0.7Hz -> b=[0.9015131894,-1.8030263787,0.9015131894] a=[-1.7933030913,0.8127496661]
//                 LP 4Hz   -> b=[0.1084474388,0.2168948777,0.1084474388] a=[-0.8772706318,0.3110603871]
//   Se recalcula por ventana si fps != 30 para mantener frecuencias analogicas.
//   Costo O(N) por ventana (2 pasadas biquad), barato por frame.
//
// Outliers RR (paso 3): Hampel con MAD
//   mediana = median(intervals), MAD = median(|v - mediana|), sigma = 1.4826*MAD
//   Retiene solo intervalos con |v-mediana| <= HAMPEL_K * sigma (HAMPEL_K tunable, default 2.5)
//
// Verificador espectral (paso 4): DFT directa 0.7-4Hz paso 0.05Hz sobre la misma senal
// filtrada. Compara bpm temporal vs pico espectral: delta<=5 -> bono +0.05 (min 1),
// delta>5 -> pena *0.65 sin descarte (el umbral 0.60 de usePPG ya veta el resto).
// Para independencia se descartan los primeros 2s del transitorio del Butterworth.

// Umbral Hampel tunable (paso 3)
const HAMPEL_K = 2.5;

// Amplitud pulsatil minima (gate pared lisa) — std de señal filtrada (luma) minima para pulso real
// Dedo tipico 1.5-2.0, pared lisa 0.4-0.6, dedo frio/debil 0.9-1.3 zona gris. Tunable arriba igual que HAMPEL_K / EXPOSURE_BIAS
const PULSATILE_MIN_STD = 1.0;

// Verificador espectral — tunables (mismo patron que HAMPEL_K / PULSATILE_MIN_STD)
const SPECTRAL_FMIN = 0.7;
const SPECTRAL_FMAX = 4.0;
const SPECTRAL_STEP = 0.05;
const SPECTRAL_SKIP_SEC = 2;
const SPECTRAL_AGREE_BPM = 5;
const SPECTRAL_BONUS = 0.05;
const SPECTRAL_PENALTY_MULT = 0.65;

function mean(arr) {
  if (!arr.length) return 0;
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += arr[i];
  return s / arr.length;
}

function std(arr, m) {
  if (!arr.length) return 0;
  const mu = m !== undefined ? m : mean(arr);
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += (arr[i] - mu) * (arr[i] - mu);
  return Math.sqrt(s / arr.length);
}

// Biquad forward-only (Direct Form I) con estado inicial cero
function biquadFilter(signal, b0, b1, b2, a1, a2) {
  const n = signal.length;
  const out = new Array(n);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < n; i++) {
    const x0 = signal[i];
    const y0 = b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    out[i] = y0;
    x2 = x1;
    x1 = x0;
    y2 = y1;
    y1 = y0;
  }
  return out;
}

function butterworthCoeffs(fc, fs, type) {
  const Q = 0.70710678;
  const w0 = (2 * Math.PI * fc) / fs;
  const cosW0 = Math.cos(w0);
  const sinW0 = Math.sin(w0);
  const alpha = sinW0 / (2 * Q);
  let b0, b1, b2;
  if (type === "hp") {
    b0 = (1 + cosW0) / 2;
    b1 = -(1 + cosW0);
    b2 = (1 + cosW0) / 2;
  } else {
    b0 = (1 - cosW0) / 2;
    b1 = 1 - cosW0;
    b2 = (1 - cosW0) / 2;
  }
  const a0 = 1 + alpha;
  const a1 = -2 * cosW0;
  const a2 = 1 - alpha;
  return { b0: b0 / a0, b1: b1 / a0, b2: b2 / a0, a1: a1 / a0, a2: a2 / a0 };
}

// Pasa-banda 0.7-4Hz como cascada HP->LP Butterworth 2º orden forward-only
function bandPassButterworth(signal, fps) {
  const fs = fps || 30;
  // Quitar DC (media) antes de filtrar para evitar transitorio grande del HP
  // con la componente continua (~150) al iniciar con estado cero
  const m = mean(signal);
  const centered = signal.map((v) => v - m);
  const hp = butterworthCoeffs(0.7, fs, "hp");
  const lp = butterworthCoeffs(4, fs, "lp");
  const afterHp = biquadFilter(centered, hp.b0, hp.b1, hp.b2, hp.a1, hp.a2);
  return biquadFilter(afterHp, lp.b0, lp.b1, lp.b2, lp.a1, lp.a2);
}

function median(arr) {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

// Hampel: descarta intervalos que se desvian > HAMPEL_K * sigma de la mediana local
// sigma = 1.4826 * MAD, MAD = median(|v - mediana|)
function hampelFilter(intervals) {
  if (intervals.length < 4) return intervals;
  const med = median(intervals);
  const absDev = intervals.map((v) => Math.abs(v - med));
  const mad = median(absDev);
  if (mad < 1e-9) return intervals;
  const sigma = 1.4826 * mad;
  const thr = HAMPEL_K * sigma;
  const out = intervals.filter((v) => Math.abs(v - med) <= thr);
  // Si filtra demasiado, conservar original para no dejar ventana vacia
  return out.length >= 2 ? out : intervals;
}

export function estimateSpectralBPM(filtered, fps) {
  if (!filtered || filtered.length < Math.round(fps * 5)) return { bpm: null, freq: null };
  const fs = fps || 30;
  const skip = Math.round(SPECTRAL_SKIP_SEC * fs);
  const start = filtered.length > skip + 30 ? skip : 0;
  const n = filtered.length - start;
  if (n < 20) return { bpm: null, freq: null };
  const twoPiDivFs = (2 * Math.PI) / fs;
  let bestFreq = null;
  let bestMag = -1;
  let bestIdx = -1;
  const mags = [];
  const freqs = [];
  let idx = 0;
  for (let f = SPECTRAL_FMIN; f <= SPECTRAL_FMAX + 1e-9; f += SPECTRAL_STEP) {
    let re = 0;
    let im = 0;
    const w = twoPiDivFs * f;
    for (let i = 0; i < n; i++) {
      const v = filtered[start + i];
      const angle = w * i;
      re += v * Math.cos(angle);
      im += v * Math.sin(angle);
    }
    const mag = Math.sqrt(re * re + im * im);
    mags.push(mag);
    freqs.push(f);
    if (mag > bestMag) {
      bestMag = mag;
      bestFreq = f;
      bestIdx = idx;
    }
    idx++;
  }
  if (bestFreq == null || bestMag <= 1e-9) return { bpm: null, freq: null };
  // Refino parabolico sobre magnitudes vecinas (misma clamp que picos)
  if (bestIdx > 0 && bestIdx < mags.length - 1) {
    const y0 = mags[bestIdx];
    const y1 = mags[bestIdx - 1];
    const y2 = mags[bestIdx + 1];
    const denom = y1 - 2 * y0 + y2;
    if (denom !== 0) {
      let p = 0.5 * (y1 - y2) / denom;
      if (p > 0.5) p = 0.5;
      else if (p < -0.5) p = -0.5;
      bestFreq += p * SPECTRAL_STEP;
    }
  }
  return { bpm: bestFreq * 60, freq: bestFreq };
}

function findPeaks(signal, fps) {
  const minDistance = Math.round(0.4 * fps); // 0.4s entre picos ~150 bpm max
  const sd = std(signal);
  // Candidatos: maximos locales con separacion minima (sin umbral aun)
  const candidates = [];
  let lastCand = -minDistance * 2;
  for (let i = 1; i < signal.length - 1; i++) {
    if (signal[i] > signal[i - 1] && signal[i] > signal[i + 1]) {
      if (i - lastCand >= minDistance) {
        candidates.push({ idx: i, h: signal[i] });
        lastCand = i;
      } else {
        // si dos candidatos muy juntos, quedarse con el mas alto
        const prev = candidates[candidates.length - 1];
        if (prev && signal[i] > signal[prev.idx]) {
          candidates[candidates.length - 1] = { idx: i, h: signal[i] };
          lastCand = i;
        }
      }
    }
  }
  if (!candidates.length) return [];
  // Umbral adaptativo: max(0.35*sigma, 0.55*P60 de alturas de candidatos)
  // P60 se ajusta solo a la calidad de la senal en la ventana (intra-ventana, sin estado entre ventanas)
  const heights = candidates.map((c) => c.h).sort((a, b) => a - b);
  const p60 = heights[Math.floor(heights.length * 0.6)] ?? 0;
  const thr = Math.max(sd * 0.35, p60 * 0.55);
  const peaks = [];
  let lastPeak = -minDistance * 2;
  for (const c of candidates) {
    if (c.h > thr && c.idx - lastPeak >= minDistance) {
      // Interpolacion parabolica alrededor del maximo local para precision sub-muestra
      // Ajusta parabola por y[-1], y0, y[+1]: p = 0.5*(y1 - y2)/(y1 -2*y0 + y2), clamp +-0.5
      const y0 = signal[c.idx];
      const y1 = signal[c.idx - 1];
      const y2 = signal[c.idx + 1];
      let refined = c.idx;
      const denom = y1 - 2 * y0 + y2;
      if (denom !== 0) {
        let p = 0.5 * (y1 - y2) / denom;
        if (p > 0.5) p = 0.5;
        else if (p < -0.5) p = -0.5;
        refined = c.idx + p;
      }
      peaks.push(refined);
      lastPeak = c.idx;
    }
  }
  return peaks;
}

export function calculateBPM(redMeans, fps) {
  // redMeans: array de valores promedio canal rojo (0-255) por frame
  if (!redMeans || redMeans.length < fps * 5) {
    return { bpm: null, confidence: 0, error: "too_short", filteredStd: 0 };
  }

  const avg = mean(redMeans);
  // validacion dedo: rojo muy bajo o varianza muy baja -> sin dedo
  if (avg < 80) {
    return { bpm: null, confidence: 0, error: "no_finger", filteredStd: 0 };
  }
  const overallStd = std(redMeans, avg);
  if (overallStd < 0.8) {
    return { bpm: null, confidence: 0, error: "low_signal", filteredStd: 0 };
  }

  // pasa-banda Butterworth 0.7-4Hz (reemplaza detrend MA30 + MA3)
  const filtered = bandPassButterworth(redMeans, fps);
  // std de señal filtrada (sin normalizar) — amplitud pulsatil real para gate de pared lisa
  const filteredStd = std(filtered, mean(filtered));

  // normalizar
  const mu = mean(filtered);
  const sd = std(filtered, mu) || 1;
  const normalized = filtered.map((v) => (v - mu) / sd);

  const peaks = findPeaks(normalized, fps);

  if (peaks.length < 3) {
    return { bpm: null, confidence: 0, error: "no_peaks", filteredStd: Number(filteredStd.toFixed(3)) };
  }

  const intervals = [];
  for (let i = 1; i < peaks.length; i++) {
    const dt = (peaks[i] - peaks[i - 1]) / fps;
    if (dt >= 0.3 && dt <= 1.5) intervals.push(dt);
  }

  if (intervals.length < 2) {
    return { bpm: null, confidence: 0, error: "unstable", filteredStd: Number(filteredStd.toFixed(3)) };
  }

  // filtrar outliers RR con Hampel antes de mediana
  const filteredIntervals = hampelFilter(intervals);
  const medianVal = median(filteredIntervals);
  const bpm = Math.round(60 / medianVal);

  if (bpm < 42 || bpm > 240) {
    return { bpm: null, confidence: 0, error: "out_of_range", filteredStd: Number(filteredStd.toFixed(3)) };
  }

  // confianza: ratio picos validos / esperados + regularidad (sobre intervalos filtrados)
  const duration = redMeans.length / fps;
  const expected = duration / medianVal;
  const ratio = Math.min(1, peaks.length / expected);
  const intervalStd = std(filteredIntervals, mean(filteredIntervals));
  const regularity = Math.max(0, 1 - intervalStd / 0.25);
  const confidence = Math.min(1, (ratio * 0.6 + regularity * 0.4));

  // Gate pulsatil para pared lisa (opcion B condicional): si amplitud filtrada baja y ademas
  // no hay periodicidad real (confidence <0.60), descartar — dedo debil con confidence alta pasa
  // aunque filteredStd esté cerca del umbral. Nota: confidence se calcula arriba, por eso el chequeo
  // va aqui y no justo tras el Butterworth. filteredStd sobre señal centrada (unidades luma).
  if (filteredStd < PULSATILE_MIN_STD && confidence < 0.60) {
    return { bpm: null, confidence: filteredStd / 2, error: "low_pulsatile", filteredStd: Number(filteredStd.toFixed(3)) };
  }

  // si confianza baja descartar
  if (confidence < 0.45) {
    return { bpm: null, confidence, error: "low_confidence", filteredStd: Number(filteredStd.toFixed(3)) };
  }

  // Verificador espectral (dominio frecuencia) — cross-validacion independiente
  // Posicionado DESPUES de los gates para no mover su calibracion.
  const spectral = estimateSpectralBPM(filtered, fps);
  let finalConfidence = confidence;
  let spectralBpm = spectral.bpm != null ? Number(spectral.bpm.toFixed(1)) : null;
  let spectralDelta = spectral.bpm != null ? Math.abs(bpm - spectral.bpm) : null;
  if (spectral.bpm != null) {
    if (spectralDelta <= SPECTRAL_AGREE_BPM) {
      finalConfidence = Math.min(1, confidence + SPECTRAL_BONUS);
    } else {
      finalConfidence = confidence * SPECTRAL_PENALTY_MULT;
    }
  }

  return { bpm, confidence: finalConfidence, error: null, peaks: peaks.length, filteredStd: Number(filteredStd.toFixed(3)), spectralBpm, spectralDelta: spectralDelta != null ? Number(spectralDelta.toFixed(1)) : null };
}

export function getPPGErrorMessage(error, t) {
  if (!t) return error;
  switch (error) {
    case "no_finger":
      return t.ppgErrorNoFinger;
    case "low_signal":
      return t.ppgErrorLowLight;
    case "too_short":
      return t.ppgErrorTooShort;
    case "no_peaks":
    case "unstable":
    case "low_confidence":
    case "low_pulsatile":
      return t.ppgErrorUnstable;
    case "out_of_range":
      return t.ppgErrorOutOfRange;
    default:
      return t.ppgErrorGeneric;
  }
}
