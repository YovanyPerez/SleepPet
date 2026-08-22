// Fotopletismografia por camara: senal roja -> BPM
// Logica: detrending + bandpass 0.7-4Hz (42-240 bpm) + peak detection

function movingAverage(data, window) {
  const result = new Array(data.length).fill(0);
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i];
    if (i >= window) sum -= data[i - window];
    const count = Math.min(i + 1, window);
    result[i] = sum / count;
  }
  return result;
}

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

// Filtro paso banda simple: detrending ya es high-pass, luego suavizado low-pass
function bandPass(signal) {
  // detrended ya quita DC (<0.7Hz aprox con MA), ahora low-pass para >4Hz
  const ma = movingAverage(signal, 3);
  return ma;
}

function findPeaks(signal, fps) {
  const minDistance = Math.round(0.4 * fps); // 0.4s entre picos ~150 bpm max
  const threshold = std(signal) * 0.5;
  const peaks = [];
  let lastPeak = -minDistance * 2;
  for (let i = 1; i < signal.length - 1; i++) {
    if (
      signal[i] > signal[i - 1] &&
      signal[i] > signal[i + 1] &&
      signal[i] > threshold &&
      i - lastPeak >= minDistance
    ) {
      peaks.push(i);
      lastPeak = i;
    }
  }
  return peaks;
}

export function calculateBPM(redMeans, fps) {
  // redMeans: array de valores promedio canal rojo (0-255) por frame
  if (!redMeans || redMeans.length < fps * 5) {
    return { bpm: null, confidence: 0, error: "too_short" };
  }

  const avg = mean(redMeans);
  // validacion dedo: rojo muy bajo o varianza muy baja -> sin dedo
  if (avg < 80) {
    return { bpm: null, confidence: 0, error: "no_finger" };
  }
  const overallStd = std(redMeans, avg);
  if (overallStd < 0.8) {
    return { bpm: null, confidence: 0, error: "low_signal" };
  }

  // detrend
  const ma = movingAverage(redMeans, 30);
  const detrended = redMeans.map((v, i) => v - ma[i]);
  const filtered = bandPass(detrended);

  // normalizar
  const mu = mean(filtered);
  const sd = std(filtered, mu) || 1;
  const normalized = filtered.map((v) => (v - mu) / sd);

  const peaks = findPeaks(normalized, fps);

  if (peaks.length < 3) {
    return { bpm: null, confidence: 0, error: "no_peaks" };
  }

  const intervals = [];
  for (let i = 1; i < peaks.length; i++) {
    const dt = (peaks[i] - peaks[i - 1]) / fps;
    if (dt >= 0.3 && dt <= 1.5) intervals.push(dt);
  }

  if (intervals.length < 2) {
    return { bpm: null, confidence: 0, error: "unstable" };
  }

  // mediana robusta
  const sorted = [...intervals].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const bpm = Math.round(60 / median);

  if (bpm < 42 || bpm > 240) {
    return { bpm: null, confidence: 0, error: "out_of_range" };
  }

  // confianza: ratio picos validos / esperados + regularidad
  const duration = redMeans.length / fps;
  const expected = duration / median;
  const ratio = Math.min(1, peaks.length / expected);
  const intervalStd = std(intervals, mean(intervals));
  const regularity = Math.max(0, 1 - intervalStd / 0.25);
  const confidence = Math.min(1, (ratio * 0.6 + regularity * 0.4));

  // si confianza baja descartar
  if (confidence < 0.45) {
    return { bpm: null, confidence, error: "low_confidence" };
  }

  return { bpm, confidence, error: null, peaks: peaks.length };
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
      return t.ppgErrorUnstable;
    case "out_of_range":
      return t.ppgErrorOutOfRange;
    default:
      return t.ppgErrorGeneric;
  }
}
