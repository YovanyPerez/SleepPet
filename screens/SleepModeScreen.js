import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
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
import { COLORS, FONT } from "../constants/theme";
import { calculateSleepRewards } from "../services/RewardService";
import useSleepSession from "../hooks/useSleepSession";
import { toDateKey } from "../utils/dateUtils";

import {
  startNotification,
  stopNotification,
} from "../services/NotificationService";


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


  const {

    running,

    startSleep,

    cancelSleep,

    stopTimer,

    formatTime,

  } = useSleepSession();


  async function handleStartSleep() {

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

    }

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

    <View style={styles.container}>

      <Text style={styles.moon}>
        🌙
      </Text>

      <Text style={styles.title}>
        {t.sleepMode}
      </Text>

      <Text style={styles.timer}>
        {formatTime()}
      </Text>

      {!running ? (

        <TouchableOpacity
          style={styles.button}
          onPress={handleStartSleep}
        >

          <Text style={styles.buttonText}>
            {t.startSleep}
          </Text>

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

            <Text style={styles.buttonText}>
              {t.finishSleep}
            </Text>

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

            <Text style={styles.buttonText}>
              {t.cancelSession}
            </Text>

          </TouchableOpacity>

        </>

      )}

    </View>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },

  moon: {
    fontSize: 80,
    marginBottom: 20,
  },

  title: {
    fontSize: FONT.title,
    fontWeight: "bold",
    marginBottom: 20,
    color: COLORS.text,
  },

  timer: {
    fontSize: 42,
    fontWeight: "bold",
    marginBottom: 40,
    color: COLORS.primary,
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