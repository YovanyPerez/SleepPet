import { useState, useRef, useCallback, useEffect } from "react";
import { useFrameProcessor } from "react-native-vision-camera";
import { Worklets } from "react-native-worklets-core";
import { calculateBPM } from "../services/PPGService";

const DEFAULT_DURATION = 15;
const DEFAULT_FPS = 30;

// Umbrales de deteccion de dedo (luminancia Y 0-255)
const FINGER_MIN = 80;
const BAD_STREAK = Math.round(DEFAULT_FPS * 0.5); // ~0.5s fuera -> cancelar toma
const GOOD_STREAK = DEFAULT_FPS; // ~1s dentro -> auto-iniciar

export default function usePPG({ duration = DEFAULT_DURATION, fps = DEFAULT_FPS } = {}) {
  const [measuring, setMeasuring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bpm, setBpm] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState(null);

  // Estadisticas en vivo
  const [stats, setStats] = useState({ count: 0, avg: null });
  const [procError, setProcError] = useState(null);
  // Pulso en vivo (estimacion con ventana deslizante)
  const [liveBpm, setLiveBpm] = useState(null);
  const [beatMs, setBeatMs] = useState(800);
  // Esperando que el usuario vuelva a colocar el dedo
  const [waitingFinger, setWaitingFinger] = useState(false);

  const bufferRef = useRef([]);
  const startRef = useRef(null);
  const timerRef = useRef(null);
  // activo = midiendo O esperando dedo (pipeline de muestras encendido)
  const activeRef = useRef(false);
  const measuringRef = useRef(false);
  const waitingRef = useRef(false);
  const sampleCounterRef = useRef(0);
  const lastAvgRef = useRef(null);
  const tickRef = useRef(0);
  const liveHistoryRef = useRef([]);
  const badStreakRef = useRef(0);
  const goodStreakRef = useRef(0);
  // referencia estable a startTake para auto-reinicio desde addSample
  const startTakeRef = useRef(null);

  const resetCounters = useCallback(() => {
    bufferRef.current = [];
    sampleCounterRef.current = 0;
    lastAvgRef.current = null;
    tickRef.current = 0;
    liveHistoryRef.current = [];
    badStreakRef.current = 0;
    goodStreakRef.current = 0;
  }, []);

  const reset = useCallback(() => {
    resetCounters();
    setProgress(0);
    setBpm(null);
    setConfidence(0);
    setError(null);
    setStats({ count: 0, avg: null });
    setProcError(null);
    setLiveBpm(null);
    setBeatMs(800);
    setMeasuring(false);
    setWaitingFinger(false);
    measuringRef.current = false;
    waitingRef.current = false;
    activeRef.current = false;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [resetCounters]);

  // Toma completa desde cero
  const startTake = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    resetCounters();
    setProgress(0);
    setBpm(null);
    setConfidence(0);
    setError(null);
    setLiveBpm(null);
    setBeatMs(800);
    setMeasuring(true);
    setWaitingFinger(false);
    measuringRef.current = true;
    waitingRef.current = false;
    activeRef.current = true;
    startRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const p = Math.min(1, elapsed / duration);
      setProgress(p);
      tickRef.current += 1;

      // Estadisticas en vivo (10Hz)
      setStats({
        count: sampleCounterRef.current,
        avg: lastAvgRef.current,
      });

      // Pulso en vivo cada ~500ms con ventana de 10s
      if (
        tickRef.current % 5 === 0 &&
        bufferRef.current.length >= fps * 6
      ) {
        const tail = bufferRef.current.slice(-fps * 10);
        const result = calculateBPM(tail, fps);
        if (result.bpm && result.confidence >= 0.5) {
          liveHistoryRef.current.push(result.bpm);
          if (liveHistoryRef.current.length > 3) {
            liveHistoryRef.current.shift();
          }
          const sorted = [...liveHistoryRef.current].sort((a, b) => a - b);
          const median = sorted[Math.floor(sorted.length / 2)];
          setLiveBpm(median);
          setBeatMs(
            Math.round(
              Math.min(1500, Math.max(350, 60000 / median)) / 25
            ) * 25
          );
        }
      }

      if (elapsed >= duration) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        let result = calculateBPM(bufferRef.current, fps);
        // Fallback: senal inestable en ventana larga -> intentar ultimos 10s
        if (
          !result.bpm &&
          ["unstable", "low_confidence", "no_peaks"].includes(result.error) &&
          bufferRef.current.length >= fps * 10
        ) {
          const tailResult = calculateBPM(
            bufferRef.current.slice(-fps * 10),
            fps
          );
          if (tailResult.bpm) {
            result = { ...tailResult };
          }
        }
        if (result.bpm) {
          setBpm(result.bpm);
          setConfidence(result.confidence);
          setError(null);
          setBeatMs(Math.round(Math.min(1500, Math.max(350, 60000 / result.bpm)) / 25) * 25);
        } else {
          setError(result.error);
          setConfidence(result.confidence || 0);
        }
        setMeasuring(false);
        measuringRef.current = false;
        activeRef.current = false;
      }
    }, 100);
  }, [duration, fps, resetCounters]);

  startTakeRef.current = startTake;

  // Entrar en estado de espera: dedo perdido -> cancelar toma actual
  const enterWaiting = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    resetCounters();
    setProgress(0);
    setLiveBpm(null);
    setWaitingFinger(true);
    measuringRef.current = false;
    waitingRef.current = true;
    activeRef.current = true; // seguir muestreando para detectar el regreso
    badStreakRef.current = 0;
    goodStreakRef.current = 0;
  }, [resetCounters]);

  const addSample = useCallback(
    (redMean) => {
      if (!activeRef.current) return;

      sampleCounterRef.current += 1;
      lastAvgRef.current = redMean;

      const ok = redMean >= FINGER_MIN;

      if (ok) {
        goodStreakRef.current += 1;
        badStreakRef.current = 0;
      } else {
        badStreakRef.current += 1;
        goodStreakRef.current = 0;
      }

      if (measuringRef.current) {
        bufferRef.current.push(redMean);
        const maxLen = duration * fps + 10;
        if (bufferRef.current.length > maxLen) {
          bufferRef.current.shift();
        }
        // Dedo perdido durante la toma -> reiniciar esperando
        if (!ok && badStreakRef.current >= BAD_STREAK) {
          enterWaiting();
        }
      } else if (waitingRef.current) {
        // Dedo de vuelta estable -> nueva toma automatica
        if (ok && goodStreakRef.current >= GOOD_STREAK) {
          startTakeRef.current?.();
        }
      }
    },
    [duration, fps, enterWaiting]
  );

  const addSampleWorkletRef = useRef(addSample);
  addSampleWorkletRef.current = addSample;

  const jsAdd = useRef(
    Worklets.createRunOnJS((value) => {
      addSampleWorkletRef.current(value);
    })
  ).current;

  const jsProcError = useRef(
    Worklets.createRunOnJS((message) => {
      setProcError(message);
    })
  ).current;

  const frameProcessor = useFrameProcessor(
    (frame) => {
      "worklet";
      try {
        // Plano Y del frame YUV: luminancia ≈ senal roja bajo flash+dedo
        const buffer = new Uint8Array(frame.toArrayBuffer());
        const wh = frame.width * frame.height;
        // Muestrear ~4k puntos del plano Y
        const step = Math.max(1, Math.floor(wh / 4096));
        let sum = 0;
        let count = 0;
        for (let i = 0; i < wh; i += step) {
          sum += buffer[i];
          count += 1;
        }
        jsAdd(sum / count);
      } catch (e) {
        jsProcError(`frame: ${e?.message ?? e}`);
      }
    },
    [jsAdd, jsProcError]
  );

  // Sparkline: copia downsampleada del buffer para render
  const getSpark = useCallback(() => {
    const buf = bufferRef.current;
    const n = buf.length;
    if (n === 0) return [];
    const points = 60;
    const step = Math.max(1, Math.floor(n / points));
    const out = [];
    for (let i = Math.max(0, n - step * points); i < n; i += step) {
      out.push(buf[i]);
    }
    return out;
  }, []);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setMeasuring(false);
    setWaitingFinger(false);
    measuringRef.current = false;
    waitingRef.current = false;
    activeRef.current = false;
  }, []);

  // Cleanup al desmontar (evita timer huerfano si el usuario sale midiendo/esperando)
  useEffect(
    () => () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    },
    []
  );

  return {
    measuring,
    progress,
    bpm,
    confidence,
    error,
    liveBpm,
    beatMs,
    stats,
    procError,
    waitingFinger,
    start: startTake,
    stop,
    reset,
    frameProcessor,
    getSpark,
    duration,
    fps,
  };
}
