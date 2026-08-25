import React, { useEffect, useState, useContext, useRef, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Linking,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Camera, useCameraDevice, useCameraPermission } from "react-native-vision-camera";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated";

import { AppContext } from "../context/AppContext";
import { getTranslations } from "../services/TranslationService";
import { NIGHT } from "../constants/theme";
import NightBackground from "../components/NightBackground";
import AppText from "../components/AppText";
import styles from "./styles/PPGMeasureScreen.styles";
import usePPG from "../hooks/usePPG";
import { getHeartRateRecommendation } from "../services/HeartRateRecommendService";

const RING_IDLE = "#C9B8E8";
const RING_DEAD = "#EF476F";
const RING_NOFINGER = "#FFB703";
const RING_OK = "#4CAF50";

// Sesgo de exposicion PPG: 0=neutral, +1/-1=±1 EV. Ajusta hasta que avg con dedo+flash quede >100 sin saturar 255.
// Actualmente 1 para corregir avg 82-91 -> >100; rollback a 0 si con 1 satura 255 constante (requiere rebuild APK release).
const EXPOSURE_BIAS = 1;
// const EXPOSURE_BIAS = 0; // rollback rapido: 0 = neutral (alternar 0/1 sin plan nuevo, solo rebuild)

export default function PPGMeasureScreen({ navigation }) {
  const { language } = useContext(AppContext);
  const t = getTranslations(language);
  const device = useCameraDevice("back");
  const { hasPermission, requestPermission } = useCameraPermission();
  const [legacyPermission, setLegacyPermission] = useState(null);

  const {
    phase,
    measuring,
    bpm,
    confidence,
    liveBpm,
    beatMs,
    stats,
    procError,
    waitingFinger,
    stabilityMs,
    attemptedOnce,
    start,
    stop,
    reset,
    frameProcessor,
    getSpark,
  } = usePPG({ fps: 30 });

  // Pipeline de camara encendido mientras mide O espera el dedo
  const ppgActive = measuring || waitingFinger;

  const [recommendation, setRecommendation] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  // Torch explicito: solo se enciende al armar, cleanupPPG es lo unico que lo apaga
  const [torchOn, setTorchOn] = useState(false);
  // Invalida re-arms/callbacks pendientes tras abandonar la pantalla
  const leavingRef = useRef(false);

  // Cleanup unico del flujo PPG: apaga torch, detiene medicion/timers/FP
  const cleanupPPG = useCallback(() => {
    leavingRef.current = true;
    setTorchOn(false);
    stop();
  }, [stop]);

  // Apagar torch al confirmar (pantalla sigue visible para el resultado)
  useEffect(() => {
    if (phase === "confirmed") {
      setTorchOn(false);
    }
  }, [phase]);

  // Red de seguridad: Android Back, replace o cualquier remove
  useEffect(() => {
    const unsub = navigation.addListener("beforeRemove", () => {
      cleanupPPG();
    });
    return unsub;
  }, [navigation, cleanupPPG]);

  // Cleanup final al desmontar (backstop)
  useEffect(() => {
    return () => {
      setTorchOn(false);
    };
  }, []);

  // Log de diagnostico (visible en adb logcat -s ReactNativeJS)
  useEffect(() => {
    if (device) {
      console.log(
        `PPG device: ${device.id} hasFlash=${device.hasFlash} hasTorch=${device.hasTorch}`
      );
    }
  }, [device]);

  const flashOk = device ? device.hasFlash === true : false;

  // Exposicion fija para PPG: VisionCamera 4.7.3 solo expone `exposure` como bias EV
  // (no hay AE lock real). raw = neutral + EXPOSURE_BIAS evita saturacion y reduce saltos.
  // Prueba con 0; si avg sigue <80 sube a +1 hasta avg>100 sin llegar a 255 constante.
  let exposureValue = 0;
  if (device && device.minExposure != null && device.maxExposure != null) {
    const neutral = Math.round((device.minExposure + device.maxExposure) / 2);
    const raw = neutral + EXPOSURE_BIAS;
    exposureValue = Math.max(device.minExposure, Math.min(device.maxExposure, raw));
  }

  const permissionOk = hasPermission || legacyPermission;

  // Auto-armar al montar cuando permiso y device esten listos (sin boton Iniciar)
  // A1: depende de device — evita torch="on" contra sesion aun no inicializada (causaba flash apagado 1ª entrada)
  useEffect(() => {
    if (device && permissionOk && phase === "idle" && !leavingRef.current) {
      start();
      setTorchOn(true);
    }
  }, [device, permissionOk, phase, start]);

  // Reintento torch si device llega tarde y ya estamos en pipeline activo
  useEffect(() => {
    if (device && permissionOk && ppgActive && !torchOn && !leavingRef.current) {
      setTorchOn(true);
    }
  }, [device, permissionOk, ppgActive, torchOn]);

  useEffect(() => {
    (async () => {
      if (Platform.OS === "android") {
        const check = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
        setLegacyPermission(check);
        if (!check && !hasPermission) {
          const req = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
          if (req !== PermissionsAndroid.RESULTS.GRANTED && req !== "granted") {
            setLegacyPermission(false);
          } else {
            setLegacyPermission(true);
          }
        }
      }
      if (!hasPermission) {
        await requestPermission();
      }
    })();
  }, [hasPermission, requestPermission]);

  useEffect(() => {
    if (bpm) {
      const rec = getHeartRateRecommendation(bpm, t);
      setRecommendation(rec);
    } else {
      setRecommendation(null);
    }
  }, [bpm, t]);

  // Corazon latiendo sincronizado al ritmo detectado
  const pulse = useSharedValue(0);
  const beatKey = Math.round(beatMs / 25);
  useEffect(() => {
    if (!measuring && !waitingFinger) {
      cancelAnimation(pulse);
      pulse.value = 0;
      return;
    }
    const up = Math.max(90, Math.round(beatMs * 0.2));
    const down = Math.max(260, beatMs - up);
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: up }),
        withTiming(0, { duration: down })
      ),
      -1
    );
    return () => cancelAnimation(pulse);
  }, [pulse, measuring, waitingFinger, beatKey]);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.22 }],
    opacity: 0.85 + pulse.value * 0.15,
  }));

  // Anillo de estado: gris idle / rojo sin frames o error / amarillo sin dedo / verde ok
  let ringColor = RING_IDLE;
  if (ppgActive) {
    if (procError || stats.avg == null) ringColor = RING_DEAD;
    else if (stats.avg < 80) ringColor = RING_NOFINGER;
    else ringColor = RING_OK;
  }

  function handleRetry() {
    leavingRef.current = false;
    reset();
    setRecommendation(null);
    start();
    setTorchOn(true);
  }

  function handleUseResult() {
    cleanupPPG();
    navigation.replace("SleepMode", {
      preSleepBpm: bpm,
      bpmConfidence: confidence,
    });
  }

  function handleSkip() {
    cleanupPPG();
    navigation.replace("SleepMode", { preSleepBpm: null });
  }

  // Nunca mostrar un BPM viejo fuera de medicion/resultado
  const displayBpm = bpm ?? liveBpm ?? "--";

  // Etiqueta de estado segun fase
  let statusLabel;
  switch (phase) {
    case "waiting":
      statusLabel = attemptedOnce ? t.ppgFingerLost : t.ppgWaitingFinger;
      break;
    case "preparing":
      statusLabel = t.ppgFingerDetected;
      break;
    case "measuring":
      statusLabel = t.ppgLive;
      break;
    case "confirmed":
      statusLabel = t.ppgSuccess;
      break;
    default:
      statusLabel = t.ppgDetecting;
  }

  // Progreso de estabilidad (barra 0..3s)
  const stabilityPct = Math.min(1, stabilityMs / 3000);
  const stabilityText =
    phase === "measuring" && liveBpm
      ? stabilityMs > 0
        ? t.ppgStableProgress.replace("{{sec}}", (stabilityMs / 1000).toFixed(1))
        : t.ppgSearching
      : "";

  // Sparkline normalizado
  const spark = getSpark();
  let sparkBars = [];
  if (spark.length > 1) {
    const min = Math.min(...spark);
    const max = Math.max(...spark);
    const range = max - min || 1;
    sparkBars = spark.map((v) => (v - min) / range);
  }

  return (
    <NightBackground colors={[NIGHT.start, "#4A4A9E", NIGHT.lavenderDark]} moon={false}>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity onPress={() => { cleanupPPG(); navigation.replace("SleepMode"); }} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <AppText style={styles.title}>{t.ppgTitle}</AppText>
          <AppText style={styles.subtitle}>{t.ppgInstruction}</AppText>

          {/* Circulo de camara con anillo de estado */}
          <View style={[styles.circleWrap, { borderColor: ringColor }]}>
            {device ? (
              <>
                <Camera
                  style={styles.circleCam}
                  device={device}
                  isActive={true}
                  torch={torchOn ? "on" : "off"}
                  frameProcessor={ppgActive ? frameProcessor : undefined}
                  pixelFormat="yuv"
                  exposure={exposureValue}
                  lowLightBoost={false}
                  onError={(e) => {
                    const msg = e?.nativeEvent?.message ?? String(e);
                    console.log("VisionCamera error:", msg);
                    setCameraError(msg.slice(0, 120));
                  }}
                />
                <Animated.View style={styles.heartOverlay} pointerEvents="none">
                  <Animated.View style={heartStyle}>
                    <MaterialCommunityIcons name="heart-pulse" size={28} color="#FFFFFF" />
                  </Animated.View>
                </Animated.View>
              </>
            ) : (
              <View style={styles.circlePlaceholder}>
                <MaterialCommunityIcons name="camera-off" size={26} color="rgba(255,255,255,0.6)" />
              </View>
            )}
          </View>

          {/* Estado + pulso en vivo */}
          <AppText style={styles.liveLabel}>
            {statusLabel}
          </AppText>
          <AppText style={styles.liveBpm}>{displayBpm}</AppText>
          <AppText style={styles.liveUnit}>{t.ppgBpmUnit}</AppText>

          {/* Sparkline de senal */}
          <View style={styles.sparkRow}>
            {sparkBars.length > 1 &&
              sparkBars.map((h, i) => (
                <View
                  key={`sp-${i}`}
                  style={[
                    styles.sparkBar,
                    { height: Math.max(3, h * styles.sparkRow.height) },
                  ]}
                />
              ))}
          </View>

          {/* Estabilidad */}
          <View style={styles.progressCard}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${stabilityPct * 100}%` }]} />
            </View>
            <AppText style={styles.progressText}>
              {phase === "confirmed"
                ? t.ppgSuccess
                : measuring
                ? t.ppgKeepStill
                : t.ppgDetecting}
            </AppText>
            {stabilityText ? (
              <AppText style={styles.debugText}>{stabilityText}</AppText>
            ) : null}
            {ppgActive && !procError && (
              <AppText style={styles.debugText}>
                {stats.count} · avg {stats.avg != null ? Math.round(stats.avg) : "--"} · textura {stats.spatialStd != null ? stats.spatialStd.toFixed(1) : "--"}
                {measuring && liveBpm
                  ? ` · estable ${Math.min(stabilityMs, 3000)}/3000ms`
                  : ""}
              </AppText>
            )}
            {cameraError && <AppText style={styles.errorText}>cam: {cameraError}</AppText>}
            {procError && <AppText style={styles.errorText}>{procError}</AppText>}
            {!flashOk && device && (
              <AppText style={styles.errorText}>{t.ppgNoFlash}</AppText>
            )}
          </View>

          {/* Resultado final */}
          {bpm && (
            <View style={styles.bpmCard}>
              <AppText style={styles.bpmValue}>{bpm} {t.ppgBpmUnit}</AppText>
              <AppText style={styles.bpmLabel}>{t.ppgConfidence}: {Math.round(confidence * 100)}%</AppText>
            </View>
          )}

          {/* Recomendacion */}
          {recommendation && (
            <View style={styles.recCard}>
              <AppText style={[styles.recTitle, { color: recommendation.color }]}>{recommendation.title}</AppText>
              <AppText style={styles.recMessage}>{recommendation.message}</AppText>
            </View>
          )}

          {/* Botones exclusivos por estado */}
          <View style={styles.buttonRow}>
            {ppgActive && (
              <TouchableOpacity style={styles.secondaryButtonWide} onPress={handleSkip}>
                <AppText style={styles.secondaryText}>{t.cancel}</AppText>
              </TouchableOpacity>
            )}
            {!ppgActive && bpm && (
              <>
                <TouchableOpacity style={styles.secondaryButton} onPress={handleRetry}>
                  <AppText style={styles.secondaryText}>{t.ppgRetry}</AppText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryButton} onPress={handleUseResult}>
                  <AppText style={styles.primaryText}>{t.continue}</AppText>
                </TouchableOpacity>
              </>
            )}
          </View>

          <AppText style={styles.disclaimer}>{t.ppgDisclaimer}</AppText>
        </ScrollView>
      </SafeAreaView>
    </NightBackground>
  );
}
