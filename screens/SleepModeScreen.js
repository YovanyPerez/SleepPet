import React, { useContext, useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
  Platform,
} from "react-native";

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
import { COLORS } from "../constants/theme";
import { calculateSleepRewards } from "../services/RewardService";
import useSleepSession from "../hooks/useSleepSession";
import { toDateKey } from "../utils/dateUtils";

import {
  startNotification,
  stopNotification,
  openNotificationSettings,
  getNotificationStatus,
} from "../services/NotificationService";

import ScreenContainer from "../components/ScreenContainer";
import AppText from "../components/AppText";


const MIN_SLEEP_HOURS = 0.5;

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


  async function handleStartSleep() {

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
    return (

    <ScreenContainer style={styles.container}>

      <AppText style={styles.moon}>
        🌙
      </AppText>

      <AppText
        variant="title"
        center
        style={styles.title}
      >
        {t.sleepMode}
      </AppText>

      <AppText style={styles.timer}>
        {formatTime()}
      </AppText>

      {
        running &&
        notificationStatus && (
          <AppText
            color={COLORS.textSecondary}
            style={styles.diag}
          >
            🔔 {
              notificationStatus.notificationsEnabled
                ? t.notifOn
                : t.notifOff
            }
            {"  "}
            ⚙️ {
              notificationStatus.serviceRunning
                ? t.serviceOn
                : t.serviceOff
            }
          </AppText>
        )
      }

      {
        running &&
        notificationStatus?.errors?.length > 0 && (
          <AppText
            color={COLORS.danger}
            style={styles.diagError}
          >
            {notificationStatus.errors[
              notificationStatus.errors.length - 1
            ]}
          </AppText>
        )
      }

      {!running ? (

        <TouchableOpacity
          style={styles.button}
          onPress={handleStartSleep}
        >

          <AppText style={styles.buttonText}>
            {t.startSleep}
          </AppText>

        </TouchableOpacity>

      ) : (

        <>

          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor: "#EF476F",
              },
            ]}
            onPress={finishSleep}
          >

            <AppText style={styles.buttonText}>
              {t.finishSleep}
            </AppText>

          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.cancelButton,
            ]}
            onPress={async () => {

              setSleepSessionStarted(false);

              setUnlockCount(0);

              setUnlockTimes([]);

              stopNotification();

              await cancelSleep();

            }}
          >

            <AppText style={styles.buttonText}>
              {t.cancelSession}
            </AppText>

          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.logButton,
            ]}
            onPress={showLog}
          >

            <AppText style={styles.buttonText}>
              {t.viewLogs}
            </AppText>

          </TouchableOpacity>

        </>

      )}

    </ScreenContainer>

  );

}

const styles = StyleSheet.create({

  container: {
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
  },

  moon: {
    fontSize: 80,
    marginBottom: 20,
  },

  title: {
    marginBottom: 20,
  },

  timer: {
    fontSize: 42,
    fontWeight: "bold",
    marginBottom: 40,
    color: COLORS.primary,
  },

  diag: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },

  diagError: {
    fontSize: 13,
    marginBottom: 30,
    marginHorizontal: 30,
    textAlign: "center",
  },

  logButton: {
    backgroundColor: COLORS.secondary,
    marginTop: 15,
  },

  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 18,
    minWidth: 220,
    alignItems: "center",
  },

  cancelButton: {
    marginTop: 15,
    backgroundColor: "#777",
  },

  buttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },

});
