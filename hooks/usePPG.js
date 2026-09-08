import { useState, useRef, useCallback, useEffect } from "react";
import { useFrameProcessor } from "react-native-vision-camera";
import { Worklets } from "react-native-worklets-core";
import { calculateBPM } from "../services/PPGService";
import { createStability, pushReading, pushMiss } from "../services/PPGStability";

const DEFAULT_FPS = 30;

// Deteccion de dedo (luminancia Y 0-255) + textura intra-frame
const FINGER_MIN = 80;
const SPATIAL_STD_MAX = 18; // textura: dedo+flash uniforme (5-12) vs habitacion (25-50). Tunable arriba igual que EXPOSURE_BIAS / HAMPEL_K
const BAD_STREAK = Math.round(DEFAULT_FPS * 0.5); // ~0.5s fuera -> descartar toma
const GOOD_STREAK = DEFAULT_FPS; // ~1s dentro -> dedo confirmado

// Confirmacion por estabilidad (sin limite de tiempo; TOL en services/PPGStability)
const STABILITY_DURATION_MS = 3000;
const MIN_CONFIDENCE_FOR_CONFIRM = 0.6;
const MIN_STABLE_READINGS = 5;
const PREPARING_MS = 350;

// Cap del buffer (la ventana de calculo usa los ultimos 10s)
const MAX_BUFFER_SECONDS = 30;

// Fases: idle | waiting | preparing | measuring | confirmed

export default function usePPG({ fps = DEFAULT_FPS } = {}) {
  const [phase, setPhaseState] = useState("idle");
  const [bpm, setBpm] = useState(null);
  const [confidence, setConfidence] = useState(0);

  // Estadisticas en vivo
  const [stats, setStats] = useState({ count: 0, avg: null, spatialStd: null });
  const [procError, setProcError] = useState(null);
  // Pulso vivo (ventana deslizante) + ms acumulados de cadena estable
  const [liveBpm, setLiveBpm] = useState(null);
  const [beatMs, setBeatMs] = useState(800);
  const [stabilityMs, setStabilityMs] = useState(0);
  // True una vez que se ha iniciado alguna toma (para texto "nueva medicion")
  const [attemptedOnce, setAttemptedOnce] = useState(false);

  const bufferRef = useRef([]);
  const timerRef = useRef(null);
  const prepTimerRef = useRef(null);
  const phaseRef = useRef("idle");
  const sampleCounterRef = useRef(0);
  const lastAvgRef = useRef(null);
  const lastSpatialStdRef = useRef(null);
  const tickRef = useRef(0);
  const liveHistoryRef = useRef([]);
  const stableChainRef = useRef(createStability());
  const badStreakRef = useRef(0);
  const goodStreakRef = useRef(0);
  const startTakeRef = useRef(null);

  const setPhaseSafe = useCallback((p) => {
    phaseRef.current = p;
    setPhaseState(p);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (prepTimerRef.current) {
      clearTimeout(prepTimerRef.current);
      prepTimerRef.current = null;
    }
  }, []);

  const resetCounters = useCallback(() => {
    bufferRef.current = [];
    sampleCounterRef.current = 0;
    lastAvgRef.current = null;
    lastSpatialStdRef.current = null;
    tickRef.current = 0;
    liveHistoryRef.current = [];
    stableChainRef.current = createStability();
    badStreakRef.current = 0;
    goodStreakRef.current = 0;
    setLiveBpm(null);
    setStabilityMs(0);
    setBeatMs(800);
  }, []);

  // Armar: entrar en espera del dedo (sin timer). Idempotente.
  const start = useCallback(() => {
    const p = phaseRef.current;
    if (
      p === "waiting" ||
      p === "preparing" ||
      p === "measuring"
    ) {
      return;
    }
    stopTimer();
    resetCounters();
    setBpm(null);
    setConfidence(0);
    console.log("PPG: waiting for finger");
    setPhaseSafe("waiting");
  }, [resetCounters, setPhaseSafe, stopTimer]);

  const finalizeResult = useCallback(
    (confirmedBpm, confirmedConfidence) => {
      stopTimer();
      setBpm(confirmedBpm);
      setConfidence(confirmedConfidence);
      setBeatMs(Math.round(Math.min(1500, Math.max(350, 60000 / confirmedBpm)) / 25) * 25);
      setPhaseSafe("confirmed");
    },
    [setPhaseSafe, stopTimer]
  );

  // Loop de medicion (solo corre en fase measuring; sin timeout)
  const startTickLoop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      tickRef.current += 1;

      setStats({
        count: sampleCounterRef.current,
        avg: lastAvgRef.current,
        spatialStd: lastSpatialStdRef.current,
      });

      // Lectura viva cada ~500ms con ventana de 10s
      if (
        tickRef.current % 5 === 0 &&
        bufferRef.current.length >= fps * 6
      ) {
        const tail = bufferRef.current.slice(-fps * 10);
        const result = calculateBPM(tail, fps);

        if (result.bpm && result.confidence >= MIN_CONFIDENCE_FOR_CONFIRM) {
          // Numero visible: mediana de las ultimas 3 validas
          liveHistoryRef.current.push(result.bpm);
          if (liveHistoryRef.current.length > 3) {
            liveHistoryRef.current.splice(0, liveHistoryRef.current.length - 3);
          }
          const sortedHist = [...liveHistoryRef.current].sort((a, b) => a - b);
          const medianHist = sortedHist[Math.floor(sortedHist.length / 2)];
          setLiveBpm(medianHist);
          setBeatMs(Math.round(Math.min(1500, Math.max(350, 60000 / medianHist)) / 25) * 25);

          // Cadena contigua de estabilidad (ancla movil + 1 miss aislado)
          stableChainRef.current = pushReading(stableChainRef.current, {
            bpm: result.bpm,
            conf: result.confidence,
            t: Date.now(),
          });

          const ch = stableChainRef.current.chain;
          if (ch.length > 1) {
            setStabilityMs(
              Math.min(STABILITY_DURATION_MS, ch[ch.length - 1].t - ch[0].t)
            );
          }

          if (
            ch.length >= MIN_STABLE_READINGS &&
            ch[ch.length - 1].t - ch[0].t >= STABILITY_DURATION_MS
          ) {
            const bpms = ch.map((x) => x.bpm).sort((a, b) => a - b);
            const confs = ch.map((x) => x.conf).sort((a, b) => a - b);
            const medianBpm = bpms[Math.floor(bpms.length / 2)];
            const medianConf = confs[Math.floor(confs.length / 2)];
            console.log("PPG: BPM confirmed = " + medianBpm + " confidence = " + medianConf.toFixed(2));
            finalizeResult(medianBpm, medianConf);
            return;
          }
        } else {
          // Lectura invalida: 1 miss aislado conserva cadena, 2 seguidos la vacian
          stableChainRef.current = pushMiss(stableChainRef.current);
          if (!stableChainRef.current.chain.length) {
            setStabilityMs(0);
          }
        }

        if (tickRef.current % 10 === 0 && result) {
          console.log(
            "PPG: live BPM = " +
              (result.bpm ?? "-") +
              " confidence = " +
              (result.confidence != null ? Number(result.confidence).toFixed(2) : "-") +
              " spectralBpm = " +
              (result.spectralBpm != null ? Number(result.spectralBpm).toFixed(1) : "-") +
              " delta = " +
              (result.spectralDelta != null ? Number(result.spectralDelta).toFixed(1) : "-") +
              " filteredStd = " +
              (result.filteredStd != null ? Number(result.filteredStd).toFixed(2) : "-") +
              " err = " +
              (result.error ?? "null")
          );
        }
      }
    }, 100);
  }, [fps, finalizeResult]);

  // Toma nueva desde cero (dedo ya confirmado)
  const startTake = useCallback(() => {
    const p = phaseRef.current;
    if (p !== "preparing" && p !== "waiting") return;
    resetCounters();
    setBpm(null);
    setConfidence(0);
    setAttemptedOnce(true);
    console.log("PPG: measurement started");
    setPhaseSafe("measuring");
    startTickLoop();
  }, [resetCounters, setPhaseSafe, startTickLoop]);

  startTakeRef.current = startTake;

  // Dedo perdido durante la toma: descartar todo y volver a esperar dedo
  const discardToWaiting = useCallback(() => {
    if (phaseRef.current !== "measuring") return;
    stopTimer();
    resetCounters();
    setBpm(null);
    setConfidence(0);
    console.log("PPG: finger lost — discarded");
    setPhaseSafe("waiting");
  }, [resetCounters, setPhaseSafe, stopTimer]);

  const addSample = useCallback(
    (redMean, spatialStd = 0) => {
      const currentPhase = phaseRef.current;
      if (
        currentPhase !== "waiting" &&
        currentPhase !== "preparing" &&
        currentPhase !== "measuring"
      ) {
        return;
      }

      sampleCounterRef.current += 1;
      lastAvgRef.current = redMean;
      lastSpatialStdRef.current = spatialStd;

      // Gate de seguridad: brillo Y uniformidad intra-frame
      const ok = redMean >= FINGER_MIN && spatialStd <= SPATIAL_STD_MAX;

      // Log temporal para calibrar SPATIAL_STD_MAX (ver adb logcat -s ReactNativeJS)
      if (sampleCounterRef.current % 30 === 0) {
        console.log(
          `PPG frame avg=${redMean.toFixed(1)} spatialStd=${spatialStd.toFixed(1)} ok=${ok} phase=${currentPhase}`
        );
      }

      if (ok) {
        goodStreakRef.current += 1;
        badStreakRef.current = 0;
      } else {
        badStreakRef.current += 1;
        goodStreakRef.current = 0;
      }

      switch (currentPhase) {
        case "waiting":
          if (ok && goodStreakRef.current >= GOOD_STREAK) {
            console.log("PPG: finger detected");
            setPhaseSafe("preparing");
            prepTimerRef.current = setTimeout(() => {
              prepTimerRef.current = null;
              startTakeRef.current?.();
            }, PREPARING_MS);
          }
          break;

        case "preparing":
          // Si el dedo se va antes de arrancar, cancelar la preparacion
          if (!ok && badStreakRef.current >= BAD_STREAK) {
            if (prepTimerRef.current) {
              clearTimeout(prepTimerRef.current);
              prepTimerRef.current = null;
            }
            resetCounters();
            setPhaseSafe("waiting");
          }
          break;

        case "measuring":
          if (ok) {
            bufferRef.current.push(redMean);
            const maxLen = fps * MAX_BUFFER_SECONDS + 10;
            if (bufferRef.current.length > maxLen) {
              bufferRef.current.shift();
            }
          }
          if (!ok && badStreakRef.current >= BAD_STREAK) {
            discardToWaiting();
          }
          break;

        default:
          break;
      }
    },
    [fps, discardToWaiting, resetCounters, setPhaseSafe]
  );

  const addSampleWorkletRef = useRef(addSample);
  addSampleWorkletRef.current = addSample;

  const jsAdd = useRef(
    Worklets.createRunOnJS((avg, spatialStd) => {
      addSampleWorkletRef.current(avg, spatialStd);
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
        // Plano Y del frame YUV: luminancia aprox senal roja bajo flash+dedo
        const buffer = new Uint8Array(frame.toArrayBuffer());
        const wh = frame.width * frame.height;
        // Muestrear ~4k puntos del plano Y — mismo sampleo para avg y varianza espacial
        const step = Math.max(1, Math.floor(wh / 4096));
        let sum = 0;
        let sumSq = 0;
        let count = 0;
        for (let i = 0; i < wh; i += step) {
          const v = buffer[i];
          sum += v;
          sumSq += v * v;
          count += 1;
        }
        const avg = sum / count;
        const variance = sumSq / count - avg * avg;
        const spatialStd = Math.sqrt(variance > 0 ? variance : 0);
        jsAdd(avg, spatialStd);
      } catch (e) {
        jsProcError("frame: " + (e?.message ?? e));
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
    stopTimer();
    phaseRef.current = "idle";
    setPhaseState("idle");
  }, [stopTimer]);

  const reset = useCallback(() => {
    stopTimer();
    resetCounters();
    setBpm(null);
    setConfidence(0);
    setStats({ count: 0, avg: null, spatialStd: null });
    setProcError(null);
    setAttemptedOnce(false);
    phaseRef.current = "idle";
    setPhaseState("idle");
  }, [resetCounters, stopTimer]);

  // Cleanup al desmontar
  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (prepTimerRef.current) clearTimeout(prepTimerRef.current);
    },
    []
  );

  return {
    phase,
    // Compatibilidad con la UI existente
    measuring: phase === "measuring",
    waitingFinger: phase === "waiting" || phase === "preparing",
    bpm,
    confidence,
    liveBpm,
    beatMs,
    stats,
    procError,
    stabilityMs,
    attemptedOnce,
    start,
    stop,
    reset,
    frameProcessor,
    getSpark,
    fps,
  };
}
