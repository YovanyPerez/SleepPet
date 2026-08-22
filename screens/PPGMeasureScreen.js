import React, { useEffect, useState, useContext } from "react";
import {
  View,
  TouchableOpacity,
  Alert,
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
import { getPPGErrorMessage } from "../services/PPGService";
import { getHeartRateRecommendation } from "../services/HeartRateRecommendService";

const RING_IDLE = "#C9B8E8";
const RING_DEAD = "#EF476F";
const RING_NOFINGER = "#FFB703";
const RING_OK = "#4CAF50";

export default function PPGMeasureScreen({ navigation }) {
  const { language } = useContext(AppContext);
  const t = getTranslations(language);
  const device = useCameraDevice("back");
  const { hasPermission, requestPermission } = useCameraPermission();
  const [legacyPermission, setLegacyPermission] = useState(null);

  const {
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
    start,
    stop,
    reset,
    frameProcessor,
    getSpark,
    duration,
  } = usePPG({ duration: 15, fps: 30 });

  // Pipeline de camara encendido mientras mide O espera el dedo
  const ppgActive = measuring || waitingFinger;

  const [recommendation, setRecommendation] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // Log de diagnostico (visible en adb logcat -s ReactNativeJS)
  useEffect(() => {
    if (device) {
      console.log(
        `PPG device: ${device.id} hasFlash=${device.hasFlash} hasTorch=${device.hasTorch}`
      );
    }
  }, [device]);

  const flashOk = device ? device.hasFlash === true : false;

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

  const permissionOk = hasPermission || legacyPermission;

  function handleStart() {
    if (!permissionOk) {
      Alert.alert(t.ppgCameraPermissionTitle, t.ppgCameraPermissionMessage, [
        { text: t.cancel, style: "cancel" },
        { text: t.openSettings, onPress: () => Linking.openSettings() },
      ]);
      return;
    }
    reset();
    setCameraReady(true);
    start();
  }

  function handleRetry() {
    reset();
    setRecommendation(null);
    start();
  }

  function handleUseResult() {
    stop();
    navigation.navigate("SleepMode", { preSleepBpm: bpm, bpmConfidence: confidence });
  }

  function handleSkip() {
    stop();
    navigation.navigate("SleepMode", { preSleepBpm: null });
  }

  const progressPct = Math.round(progress * duration);
  const errorMessage = error ? getPPGErrorMessage(error, t) : null;
  const displayBpm = liveBpm ?? "--";

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
          <TouchableOpacity onPress={() => { stop(); navigation.goBack(); }} style={styles.backButton}>
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
                  torch={ppgActive ? "on" : "off"}
                  frameProcessor={ppgActive ? frameProcessor : undefined}
                  pixelFormat="yuv"
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

          {/* Pulso en vivo */}
          <AppText style={styles.liveLabel}>
            {waitingFinger ? t.ppgFingerLost : measuring ? t.ppgLive : t.ppgDetecting}
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

          {/* Progreso */}
          <View style={styles.progressCard}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
            </View>
            <AppText style={styles.progressText}>
              {waitingFinger
                ? "0s / 15s"
                : measuring
                ? `${progressPct}s / ${duration}s`
                : bpm
                ? `${t.ppgSuccess}`
                : t.ppgNoBpm}
            </AppText>
            {ppgActive && !procError && (
              <AppText style={styles.debugText}>
                {stats.count} · {stats.avg != null ? Math.round(stats.avg) : "--"}
              </AppText>
            )}
            {cameraError && <AppText style={styles.errorText}>cam: {cameraError}</AppText>}
            {procError && <AppText style={styles.errorText}>{procError}</AppText>}
            {errorMessage && <AppText style={styles.errorText}>{errorMessage}</AppText>}
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
            {!ppgActive && !bpm && !error && (
              <>
                <TouchableOpacity style={styles.secondaryButton} onPress={handleSkip}>
                  <AppText style={styles.secondaryText}>{t.ppgSkip}</AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryButton, !permissionOk && styles.disabledButton]}
                  onPress={handleStart}
                >
                  <AppText style={styles.primaryText}>{t.ppgStart}</AppText>
                </TouchableOpacity>
              </>
            )}
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
            {!ppgActive && !bpm && error && (
              <>
                <TouchableOpacity style={styles.secondaryButton} onPress={handleSkip}>
                  <AppText style={styles.secondaryText}>{t.ppgSkip}</AppText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryButton} onPress={handleRetry}>
                  <AppText style={styles.primaryText}>{t.ppgRetry}</AppText>
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
