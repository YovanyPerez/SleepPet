import React, {
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
  Platform,
  Animated,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import {
  finishSleepSession,
  getCurrentSleepSession,
} from "../services/SleepService";
import { getHeartRateRecommendation } from "../services/HeartRateRecommendService";
import AppIcon from "../components/AppIcon";

import {
  getXPFromQuality,
  addXP,
} from "../services/LevelService";

import {
  saveSleepSession,
} from "../storage/SleepStorage";

import {
  saveUnlockedAchievements,
} from "../storage/AchievementStorage";

import {
  unlockAchievements,
} from "../services/AchievementService";

import {
  getTranslations,
} from "../services/TranslationService";

import { AppContext } from "../context/AppContext";
import { NIGHT } from "../constants/theme";
import { calculateSleepRewards } from "../services/RewardService";
import { calculatePetHappiness } from "../services/PetHappinessService";
import { computeStreakUpdate, STREAK_MIN_HOURS } from "../services/StreakService";
import useSleepSession from "../hooks/useSleepSession";
import { toDateKey } from "../utils/dateUtils";

import {
  startNotification,
  stopNotification,
  openNotificationSettings,
  getNotificationStatus,
} from "../services/NotificationService";

import {
  getMovementSummary,
  clearMovementSummary,
} from "../services/MovementService";

import {
  setSleepActive,
} from "../services/ReminderService";

import {
  isAccessibilityEnabled,
  openAccessibilitySettings,
} from "../services/AccessibilityListener";

import NightBackground from "../components/NightBackground";
import GlowMoon from "../components/GlowMoon";
import AppText from "../components/AppText";
import styles from "./styles/SleepModeScreen.styles";


const MIN_SLEEP_HOURS = 0.5;

function TrackingDot() {

  const anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  return (
    <Animated.View style={[styles.trackingDot, { opacity: anim }]} />
  );
}

export default function SleepModeScreen({ navigation }) {

  const {

    streak,
    setStreak,

    coins,
    setCoins,

    xp,
    setXp,

    level,
    setLevel,

    language,

    setLastSleepSession,
    setPetMood,
    setLastSleepHours,

    petHappiness,
    setPetHappiness,

    setLastHappinessUpdate,

    sleepHistory,
    setSleepHistory,

    ownedPets,

    unlockedAchievements,
    setUnlockedAchievements,

    setAchievementPopup,

    sleepSessionStarted,
    setSleepSessionStarted,

    unlockCount,
    setUnlockCount,

    unlockTimes,
    setUnlockTimes,

    goalHours,

    preSleepBpm,
    setPreSleepBpm,

    bpmConfidence,
    setBpmConfidence,

    lastStreakDateKey,
    setLastStreakDateKey,

  } = useContext(AppContext);

  const t = getTranslations(language);

  const recommendation = getHeartRateRecommendation(preSleepBpm, t);

  const [notificationStatus, setNotificationStatus] =
    useState(null);

  const [logLines, setLogLines] = useState([]);

  const appear = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(appear, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, [appear]);

  // recibir bpm desde PPGMeasure
  useEffect(() => {
    const params = navigation.getState?.()?.routes?.find((r) => r.name === "SleepMode")?.params;
    const bpmParam = params?.preSleepBpm;
    const confParam = params?.bpmConfidence;
    if (bpmParam !== undefined) {
      if (bpmParam) {
        setPreSleepBpm(bpmParam);
        setBpmConfidence(confParam ?? null);
        addLog(`Pulso pre-sueno: ${bpmParam} lpm`);
      } else {
        setPreSleepBpm(null);
        setBpmConfidence(null);
      }
    }
  }, []);

  useEffect(() => {
    const unsub = navigation.addListener("focus", () => {
      const state = navigation.getState();
      const route = state.routes.find((r) => r.name === "SleepMode");
      const p = route?.params;
      if (p && "preSleepBpm" in p) {
        if (p.preSleepBpm) {
          setPreSleepBpm(p.preSleepBpm);
          setBpmConfidence(p.bpmConfidence ?? null);
        } else if (p.preSleepBpm === null) {
          setPreSleepBpm(null);
          setBpmConfidence(null);
        }
        // limpiar param para no re-aplicar
        navigation.setParams({ preSleepBpm: undefined, bpmConfidence: undefined });
      }
    });
    return unsub;
  }, [navigation, setPreSleepBpm, setBpmConfidence]);

  function addLog(line) {
    const time = new Date().toLocaleTimeString();
    setLogLines((prev) =>
      [`${time} ${line}`, ...prev].slice(0, 30)
    );
  }

  function showLog() {
    const nativeErrors =
      notificationStatus?.errors?.length
        ? notificationStatus.errors.join("\n")
        : t.noNativeErrors;
    Alert.alert(
      "SleepPet Logs",
      `${logLines.length ? logLines.join("\n") : t.noLogs}\n\n── ${t.nativeSection} ──\n${nativeErrors}`
    );
  }

  const {

    running,

    startSleep,

    cancelSleep,

    stopTimer,

    formatTime,

  } = useSleepSession();

  // Movimiento nocturno en vivo: el detector corre en el servicio nativo,
  // aquí solo se consulta el resumen cada 30s para la card (epochs de 5 min)
  const [movementEvents, setMovementEvents] = useState(0);
  // Fase A Smart Sleep: ventanas 30s (debug temporal para validar logcat)
  const [smartWindows, setSmartWindows] = useState([]);
  const [smartWindowMs, setSmartWindowMs] = useState(30000);

  useEffect(() => {
    if (!running) {
      setMovementEvents(0);
      setSmartWindows([]);
      return;
    }
    let alive = true;
    const fetchMovement = async () => {
      const mv = await getMovementSummary();
      if (alive) {
        setMovementEvents(mv.events);
        setSmartWindows(Array.isArray(mv.smartWindows) ? mv.smartWindows : []);
        if (typeof mv.smartWindowMs === "number") setSmartWindowMs(mv.smartWindowMs);
      }
    };
    fetchMovement();
    const id = setInterval(fetchMovement, 30000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [running]);

  function paddedTime() {
    const parts = formatTime().split(":");
    const h = parts[0].padStart(2, "0");
    return `${h}:${parts[1]}:${parts[2]}`;
  }

  async function handleStartSleep() {

    // Bloqueo: requiere servicio de accesibilidad para contar desbloqueos
    try {
      const enabled = await isAccessibilityEnabled();
      if (!enabled) {
        Alert.alert(
          t.accessibilityRequiredTitle,
          t.accessibilityRequiredMessage,
          [
            {
              text: t.cancel,
              style: "cancel",
            },
            {
              text: t.openAccessibility,
              onPress: () => {
                openAccessibilitySettings();
              },
            },
          ]
        );
        addLog("Accesibilidad no activa — sesión bloqueada");
        return;
      }
    } catch (e) {
      // Si falla el check, se continúa pero se loguea
      addLog(`Error check accesibilidad: ${e?.message ?? e}`);
    }

    if (Platform.OS === "android") {
      try {

        if (Platform.Version >= 33) {

          const result =
            await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            );

          addLog(`Permiso notificaciones: ${result}`);

          if (
            result !== "granted" &&
            result !== PermissionsAndroid.RESULTS.GRANTED
          ) {

            Alert.alert(
              t.notificationsBlockedTitle,
              t.notificationsBlockedMessage,
              [
                {
                  text: t.cancel,
                  style: "cancel",
                },
                {
                  text: t.openSettings,
                  onPress: () => {
                    openNotificationSettings();
                  },
                },
              ]
            );

          }

        }

        const activityResult =
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION
          );

        addLog(`Permiso actividad: ${activityResult}`);

        if (
          activityResult !== "granted" &&
          activityResult !== PermissionsAndroid.RESULTS.GRANTED
        ) {

          Alert.alert(
            t.activityPermissionTitle,
            t.activityPermissionMessage,
            [
              {
                text: t.cancel,
                style: "cancel",
              },
              {
                text: t.openSettings,
                onPress: () => {
                  openNotificationSettings();
                },
              },
            ]
          );

        }

      } catch (e) {

        // Si no concede, la sesión continúa sin notificación.

      }
    }

    setSleepSessionStarted(true);

    setSleepActive(true);

    setUnlockCount(0);

    setUnlockTimes([]);

    await startSleep({ preSleepBpm, bpmConfidence });

    const current = await getCurrentSleepSession();

    if (current) {

      startNotification(
        current.startTime,
        t.notificationChannel,
        t.notificationChannelDescription,
        t.notificationTitle,
        t.notificationRunning,
        t.notificationTime,
        t.notificationUnlocks,
        false
      );

      addLog("startNotification llamada");

    } else {

      addLog("Sin sesión activa al iniciar");

    }

    getNotificationStatus()
      .then((status) => {
        setNotificationStatus(status);
        addLog(
          `Estado: 🔔=${status.notificationsEnabled} ⚙️=${status.serviceRunning}` +
            (status.errors?.length
              ? ` (${status.errors.length} errores nativos)`
              : "")
        );
      })
      .catch((e) => {
        setNotificationStatus(null);
        addLog(`Error leyendo estado: ${e?.message ?? e}`);
      });

  }

  async function finishSleep() {

    const result = await finishSleepSession();

    if (!result) return;

    stopTimer();

    stopNotification();

    setSleepActive(false);

    setSleepSessionStarted(false);

    // Movimiento nocturno: leer el resumen del detector nativo (el servicio
    // hace flush terminal al detenerse) y limpiarlo SIEMPRE, incluso si la
    // sesión se descarta por corta, para no mezclar datos entre sesiones.
    const movement = await getMovementSummary();

    clearMovementSummary();

    if (result.hours < MIN_SLEEP_HOURS) {

      Alert.alert(t.sleepTooShort);

      return;

    }

    // Siesta (<3h, mismo umbral que la racha): se guarda en historial pero
    // sin recompensas — 0 monedas, 0 XP, sin logros, mascota intacta
    const isNap = result.hours < STREAK_MIN_HOURS;

    const reward = calculateSleepRewards({

     hours: result.hours,

     goalHours,

     unlockCount,

    });

    // La felicidad de la mascota solo cambia con noches completas;
    // una siesta no la castiga ni la mejora
    if (!isNap) {
      setPetHappiness(
        calculatePetHappiness(petHappiness, {
          score: reward.score,
          hours: result.hours,
        })
      );
    }

    setLastHappinessUpdate(Date.now());

    const earnedXP = isNap ? 0 : getXPFromQuality(
      reward.quality
    );

    const levelData = isNap
      ? { xp, level, levelUp: false }
      : addXP(

        level,

        xp,

        earnedXP

      );

    const session = {

      date: new Date().toLocaleDateString(),

      dateKey: toDateKey(new Date()),

      start: result.start.toLocaleTimeString(),

      end: result.end.toLocaleTimeString(),

      startMs: result.start.getTime(),

      endMs: result.end.getTime(),

      hours: Number(result.hours.toFixed(2)),

      isNap,

      coins: isNap ? 0 : reward.coins,

      mood: reward.mood,

      quality: reward.quality,

      score: reward.score,

      penalty: reward.penalty,

      earnedXP,

      unlockCount,

      unlockTimes,

      preSleepBpm: result.preSleepBpm ?? preSleepBpm ?? null,

      bpmConfidence: result.bpmConfidence ?? bpmConfidence ?? null,

      bpmCapturedAt: result.bpmCapturedAt ?? null,

      bpmSource: result.preSleepBpm ? "camera_ppg" : null,

      movementEvents: movement.events ?? 0,

      movementScore: movement.score ?? 0,

      movementEpochs: movement.epochs ?? [],

      // Fase A Smart Sleep: ventanas 30s (sin mic, sin reglas) — guardado para debug/validación
      smartWindows: movement.smartWindows ?? [],

      smartWindowMs: movement.smartWindowMs ?? 30000,

      levelUp: levelData.levelUp,

      previousLevel: level,

      newLevel: levelData.level,

      currentXP: levelData.xp,

    };

    setLastSleepSession(session);

    setLastSleepHours(session.hours);

    setXp(levelData.xp);

    setLevel(levelData.level);

    // Una siesta no cambia el estado de ánimo de la mascota
    if (!isNap) {
      setPetMood(reward.mood);
    }

    // Racha diaria (regla B): >=3h cuenta 1x/dia, siestas neutras,
    // saltarse un dia completo rompe la cadena
    const streakUpdate = computeStreakUpdate({
      currentStreak: streak,
      lastStreakDateKey,
      sessionEnd: result.end,
      hoursSlept: session.hours,
    });

    setStreak(streakUpdate.streak);

    setLastStreakDateKey(streakUpdate.lastStreakDateKey);

    await saveSleepSession(session);

    setSleepHistory([
      session,
      ...sleepHistory,
    ]);

    // Siestas no cuentan para logros: sin chequeo, sin popup, sin bonus
    let finalCoins = coins + (isNap ? 0 : reward.coins);

    if (!isNap) {

      const achievementResult = unlockAchievements(

        {

          // Las siestas no avanzan logros de sesiones
          sessions:

            sleepHistory.filter((s) => !s.isNap).length + 1,

          streak: streakUpdate.streak,

          coins:

            coins + reward.coins,

          level:

            levelData.level,

          pets:

            ownedPets.length,

        },

        unlockedAchievements

      );

      if (achievementResult.newAchievements.length > 0) {

        const updatedAchievements = [

          ...unlockedAchievements,

          ...achievementResult.newAchievements,

        ];

        setUnlockedAchievements(
          updatedAchievements
        );

        await saveUnlockedAchievements(
          updatedAchievements
        );

        finalCoins += achievementResult.rewardCoins;

        // Popup global de logro (overlay del AppNavigator) en lugar de Alert;
        // nombres traducidos vía t[<key de traducción del logro>]
        const achievementNames = achievementResult.newAchievements
          .map((a) => t[a.title] ?? a.title)
          .join(" · ");

        setAchievementPopup({
          visible: true,
          title: achievementNames,
          reward: achievementResult.rewardCoins,
        });

      }

    }

    setCoins(finalCoins);

    setUnlockCount(0);

    setUnlockTimes([]);

    setPreSleepBpm(null);

    setBpmConfidence(null);

    navigation.navigate("Results");

  }

  const cardOpacity = appear.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const cardTranslate = appear.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 0],
  });

  return (

    <NightBackground
      colors={[NIGHT.start, "#4A4A9E", NIGHT.lavenderDark]}
      moon={false}
    >

      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >

          {/* Cápsula de estado */}

          <View style={[styles.pill, running && styles.pillActive]}>

            {
              running ? (
                <View style={styles.pillDot} />
              ) : (
                <MaterialCommunityIcons
                  name="weather-night"
                  size={16}
                  color="#FFFFFF"
                />
              )
            }

            <AppText style={styles.pillText}>
              {running ? t.sleepModeActive : t.readyForSleep}
            </AppText>

          </View>

          {/* Luna principal */}

          <GlowMoon size={110} />

          {/* Título y subtítulo */}

          <AppText style={styles.title}>
            {t.sleepMode}
          </AppText>

          <AppText style={styles.subtitle}>
            {running ? t.trackingSubtitle : t.readyToTrack}
          </AppText>

          {/* Contador */}

          <AppText style={styles.timer}>
            {paddedTime()}
          </AppText>

          <View style={styles.timeLabels}>
            <AppText style={styles.timeLabel}>{t.timeHrs}</AppText>
            <AppText style={styles.timeLabel}>{t.timeMin}</AppText>
            <AppText style={styles.timeLabel}>{t.timeSec}</AppText>
          </View>

          {/* Indicador de tracking */}

          {
            running && (
              <View style={styles.trackingRow}>
                <TrackingDot />
                <AppText style={styles.trackingText}>
                  {t.sleepTrackingActive}
                </AppText>
              </View>
            )
          }

          {/* Phone unlocks */}

          <Animated.View
            style={[
              styles.cardFade,
              {
                opacity: cardOpacity,
                transform: [{ translateY: cardTranslate }],
              },
            ]}
          >

            <View style={styles.glassCard}>

              <View style={styles.cardHeader}>

                <View style={styles.cardIconCircle}>
                  <MaterialCommunityIcons
                    name="cellphone-lock"
                    size={22}
                    color={NIGHT.end}
                  />
                </View>

                <AppText style={styles.cardTitle}>
                  {t.phoneUnlocks}
                </AppText>

              </View>

              <AppText style={styles.cardValue}>
                {unlockCount}
              </AppText>

              <AppText style={styles.cardHint}>
                {t.keepPhoneDown}
              </AppText>

            </View>

            {/* Movimiento nocturno */}

            <View style={styles.glassCard}>

              <View style={styles.cardHeader}>

                <View style={styles.cardIconCircle}>
                  <AppIcon name="movement" size={22} color={NIGHT.end} />
                </View>

                <AppText style={styles.cardTitle}>
                  {t.movementTitle}
                </AppText>

              </View>

              <AppText style={styles.cardValue}>
                {movementEvents} {t.movementEventsShort}
              </AppText>

              <AppText style={styles.cardHint}>
                {t.movementNightHint}
              </AppText>

            </View>

            {/* Fase A Smart Sleep debug — temporal solo para validar logcat, sin mic ni reglas */}
            {running && (
              <View style={[styles.glassCard, { borderStyle: "dashed", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)" }]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIconCircle, { backgroundColor: "rgba(255,209,102,0.18)" }]}>
                    <AppIcon name="night" size={22} color={NIGHT.yellow} />
                  </View>
                  <AppText style={styles.cardTitle}>Smart Sleep (Fase A)</AppText>
                  <View style={{ marginLeft: 8, backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
                    <AppText style={{ color: "rgba(255,255,255,0.85)", fontSize: 10, fontFamily: "Nunito_700Bold" }}>DEBUG</AppText>
                  </View>
                </View>
                {(() => {
                  const n = smartWindows.length;
                  const last = n > 0 ? smartWindows[n - 1] : null;
                  const avg = last ? last.avgMovement : 0;
                  const max = last ? last.maxMovement : 0;
                  const level = avg < 0.93 ? "LOW" : avg < 1.02 ? "MED" : "HIGH";
                  const levelColor = level === "LOW" ? "#8FA3FF" : level === "MED" ? "#FFD166" : "#FF8FAB";
                  return (
                    <>
                      <AppText style={styles.cardValue}>
                        {n} ventanas · {Math.round(smartWindowMs / 1000)}s
                      </AppText>
                      <AppText style={styles.cardHint}>
                        {n > 0 ? `última avg ${avg.toFixed(3)} · max ${max.toFixed(2)} · ${level}` : "esperando primera ventana 30s…"}
                      </AppText>
                      {n > 0 && (
                        <View style={{ marginTop: 8, flexDirection: "row", alignItems: "center", gap: 6 }}>
                          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: levelColor }} />
                          <AppText style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, fontFamily: "Nunito_600SemiBold" }}>
                            {level === "LOW" ? "quieto" : level === "MED" ? "movimiento leve" : "movimiento alto"} · ver logcat SmartSleep
                          </AppText>
                        </View>
                      )}
                      <AppText style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, fontFamily: "Nunito_400Regular", marginTop: 6, textAlign: "center" }}>
                        Estimación por movimiento · no médica · Fase A sin mic
                      </AppText>
                    </>
                  );
                })()}
              </View>
            )}

            {/* Mensaje motivacional */}

            <View style={[styles.glassCard, styles.motivationalCard]}>

              <Ionicons name="moon" size={18} color={NIGHT.end} />

              <AppText style={styles.motivationalTitle}>
                {t.greatJob}
              </AppText>

              <AppText style={styles.motivationalText}>
                {t.motivationalText}
              </AppText>

            </View>

            {/* PPG pre-sueno card - solo cuando no esta corriendo */}
            {!running && (
              <View style={[styles.glassCard, { marginTop: 16, paddingVertical: 18 }]}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIconCircle}>
                    <AppIcon name="heartPulse" size={22} color={NIGHT.end} />
                  </View>
                  <AppText style={styles.cardTitle}>{t.ppgTitle}</AppText>
                </View>
                {preSleepBpm ? (
                  <>
                    <AppText style={[styles.cardValue, { fontSize: 32 }]}>{preSleepBpm} {t.ppgBpmUnit}</AppText>
                    <AppText style={styles.cardHint}>{t.ppgPulseCaptured} • {t.ppgConfidence} {Math.round((bpmConfidence ?? 0) * 100)}%</AppText>
                    {recommendation && (
                      <View style={{ marginTop: 12, backgroundColor: "rgba(255,255,255,0.85)", borderRadius: 16, padding: 12, width: "100%" }}>
                        <AppText style={{ color: recommendation.color, fontFamily: "Nunito_800ExtraBold", fontSize: 13 }}>{recommendation.title}</AppText>
                        <AppText style={{ color: "#4A3F8F", fontFamily: "Nunito_400Regular", fontSize: 12, marginTop: 4 }}>{recommendation.message}</AppText>
                      </View>
                    )}
                    <View style={{ flexDirection: "row", gap: 10, marginTop: 14, width: "100%" }}>
                      <TouchableOpacity style={[styles.mainButton, { flex: 1, marginTop: 0, paddingVertical: 12, backgroundColor: "rgba(94,96,206,0.12)", borderWidth: 1, borderColor: NIGHT.end }]} onPress={() => navigation.replace("PPGMeasure")}>
                        <AppText style={[styles.mainButtonTitle, { color: NIGHT.end, fontSize: 14, marginTop: 0 }]}>{t.ppgRetry.toUpperCase()}</AppText>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.mainButton, { flex: 1, marginTop: 0, paddingVertical: 12 }]} onPress={() => { setPreSleepBpm(null); setBpmConfidence(null); }}>
                        <AppText style={[styles.mainButtonTitle, { fontSize: 14, marginTop: 0 }]}>{t.ppgSkip.toUpperCase()}</AppText>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <AppText style={[styles.cardHint, { textAlign: "center" }]}>{t.ppgPreSleepCardDesc}</AppText>
                    <AppText style={[styles.cardHint, { fontSize: 11, marginTop: 6, textAlign: "center", opacity: 0.7 }]}>{t.ppgDisclaimer}</AppText>
                    <TouchableOpacity style={[styles.mainButton, { marginTop: 14, paddingVertical: 12, width: "100%" }]} onPress={() => navigation.replace("PPGMeasure")}>
                      <AppIcon name="heartPulse" size={20} color="#FFFFFF" />
                      <AppText style={[styles.mainButtonTitle, { fontSize: 14, marginTop: 4 }]}>{t.ppgStart.toUpperCase()}</AppText>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}

            {/* Botón principal */}

            <TouchableOpacity
              style={styles.mainButton}
              onPress={running ? finishSleep : handleStartSleep}
            >

              {
                running ? (
                  <Ionicons name="sunny" size={26} color={NIGHT.yellow} />
                ) : (
                  <MaterialCommunityIcons
                    name="weather-night"
                    size={26}
                    color={NIGHT.yellow}
                  />
                )
              }

              <AppText style={styles.mainButtonTitle}>
                {(running ? t.wakeUp : t.startSleep).toUpperCase()}
              </AppText>

              <AppText style={styles.mainButtonSubtitle}>
                {running ? t.finishSessionSubtitle : t.startSleepNightSubtitle}
              </AppText>

            </TouchableOpacity>

          </Animated.View>

          {/* Acceso secundario a logs */}

          <TouchableOpacity
            style={styles.logsLink}
            onPress={showLog}
          >
            <AppText style={styles.logsText}>
              {t.viewLogs}
            </AppText>
          </TouchableOpacity>

        </ScrollView>

      </SafeAreaView>

    </NightBackground>

  );

}

