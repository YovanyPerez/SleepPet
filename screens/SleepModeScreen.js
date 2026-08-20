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
import useSleepSession from "../hooks/useSleepSession";
import { toDateKey } from "../utils/dateUtils";

import {
  startNotification,
  stopNotification,
  openNotificationSettings,
  getNotificationStatus,
} from "../services/NotificationService";

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

    sleepSessionStarted,
    setSleepSessionStarted,

    unlockCount,
    setUnlockCount,

    unlockTimes,
    setUnlockTimes,

    goalHours,

  } = useContext(AppContext);

  const t = getTranslations(language);

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

    await startSleep();

    const current = await getCurrentSleepSession();

    if (current) {

      startNotification(
        current.startTime,
        t.notificationChannel,
        t.notificationChannelDescription,
        t.notificationTitle,
        t.notificationRunning,
        t.notificationTime,
        t.notificationUnlocks
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

    if (result.hours < MIN_SLEEP_HOURS) {

      Alert.alert(t.sleepTooShort);

      return;

    }

    const reward = calculateSleepRewards({

     hours: result.hours,

     goalHours,

     unlockCount,

    });

    setPetHappiness(
      calculatePetHappiness(petHappiness, {
        score: reward.score,
        hours: result.hours,
      })
    );

    setLastHappinessUpdate(Date.now());

    const earnedXP = getXPFromQuality(
      reward.quality
    );

    const levelData = addXP(

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

      coins: reward.coins,

      mood: reward.mood,

      quality: reward.quality,

      score: reward.score,

      penalty: reward.penalty,

      earnedXP,

      unlockCount,

      unlockTimes,

      levelUp: levelData.levelUp,

      previousLevel: level,

      newLevel: levelData.level,

      currentXP: levelData.xp,

    };

    setLastSleepSession(session);

    setLastSleepHours(session.hours);

    setXp(levelData.xp);

    setLevel(levelData.level);

    setPetMood(reward.mood);

    if (session.hours >= 7) {

      setStreak(streak + 1);

    } else {

      setStreak(0);

    }

    await saveSleepSession(session);

    setSleepHistory([
      session,
      ...sleepHistory,
    ]);

    const achievementResult = unlockAchievements(

      {

        sessions: sleepHistory.length + 1,

        streak:

          session.hours >= 7

            ? streak + 1

            : 0,

        coins:

          coins + reward.coins,

        level:

          levelData.level,

        pets:

          ownedPets.length,

      },

      unlockedAchievements

    );

    let finalCoins = coins + reward.coins;

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

      Alert.alert(

        `🏆 ${t.achievementUnlocked}`,

        t.achievementReward.replace(

          "{{coins}}",

          achievementResult.rewardCoins

        )

      );

    }

    setCoins(finalCoins);

    setUnlockCount(0);

    setUnlockTimes([]);

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

