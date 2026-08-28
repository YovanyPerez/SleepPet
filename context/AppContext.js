import React, {
  createContext,
  useState,
  useEffect,
} from "react";

import {
  saveAppData,
  loadAppData,
} from "../storage/AppStorage";

import {
  getSleepHistory,
} from "../storage/SleepStorage";

import {
  loadUnlockedAchievements,
  saveUnlockedAchievements,
} from "../storage/AchievementStorage";

import {
  startAccessibilityListener,
  stopAccessibilityListener,
} from "../services/AccessibilityListener";

import {
  getCurrentSleepSession,
  updateUnlockState,
} from "../services/SleepService";

import {
  startNotification,
  updateUnlocks,
} from "../services/NotificationService";

import {
  scheduleReminder,
  setSleepActive,
} from "../services/ReminderService";

import {
  getReminderSettings,
} from "../storage/ReminderStorage";

import {
  getTranslations,
} from "../services/TranslationService";

import {
  decayPetHappiness,
} from "../services/PetHappinessService";


export const AppContext = createContext();

export function AppProvider({ children }) {

  // ===========================
  // Estado de carga
  // ===========================

  const [loading, setLoading] = useState(true);

  // ===========================
  // Perfil
  // ===========================

  const [userName, setUserName] = useState("");

  const [petNames, setPetNames] = useState({});

  const [userAge, setUserAge] = useState(null);

  const [goalHours, setGoalHours] = useState(8);

  const [goalType, setGoalType] = useState("");

  const [selectedPet, setSelectedPet] = useState("cat");

  const [ownedPets, setOwnedPets] = useState(["cat"]);

  const [language, setLanguage] = useState("en");

  // ===========================
  // Logros
  // ===========================

  const [
    unlockedAchievements,
    setUnlockedAchievements,
  ] = useState([]);

  const [
    achievementPopup,
    setAchievementPopup,
  ] = useState({

    visible: false,

    title: "",

    reward: 0,

  });

  // ===========================
  // Mascota
  // ===========================

  const [petMood, setPetMood] = useState("happy");

  const [petHappiness, setPetHappiness] = useState(100);

  const [
    lastHappinessUpdate,
    setLastHappinessUpdate,
  ] = useState(Date.now());

  // ===========================
  // Economía
  // ===========================

  const [coins, setCoins] = useState(0);

  // ===========================
  // Nivel
  // ===========================

  const [level, setLevel] = useState(1);

  const [xp, setXp] = useState(0);

  // ===========================
  // Racha
  // ===========================

  const [streak, setStreak] = useState(0);

  // ===========================
  // Historial
  // ===========================

  const [sleepHistory, setSleepHistory] = useState([]);

  // ===========================
  // Última sesión
  // ===========================

  const [lastSleepHours, setLastSleepHours] = useState(0);

  const [lastSleepSession, setLastSleepSession] = useState(null);

  // ===========================
  // Sleep Session
  // ===========================

  const [
    sleepSessionStarted,
    setSleepSessionStarted,
  ] = useState(false);

  const [
    unlockCount,
    setUnlockCount,
  ] = useState(0);

  const [
    unlockTimes,
    setUnlockTimes,
  ] = useState([]);

  const [preSleepBpm, setPreSleepBpm] = useState(null);

  const [bpmConfidence, setBpmConfidence] = useState(null);

  const [lastStreakDateKey, setLastStreakDateKey] = useState(null);

  // ===========================
  // Cargar datos
  // ===========================

  useEffect(() => {

    async function loadData() {

      const data = await loadAppData();

      if (data) {

        setCoins(data.coins ?? 0);

        setStreak(data.streak ?? 0);

        setPetMood(data.petMood ?? "happy");

        setPetHappiness(
          data.petHappiness ?? 100
        );

        setUserName(data.userName ?? "");

        setPetNames(
          data.petNames ??
            (data.petName ? { cat: data.petName } : {})
        );

        setUserAge(data.userAge ?? null);

        setGoalHours(data.goalHours ?? 8);

        setGoalType(data.goalType ?? "");

        setSelectedPet(
          data.selectedPet ?? "cat"
        );

        setOwnedPets(
          data.ownedPets ?? ["cat"]
        );

        setLanguage(data.language ?? "en");

        setLevel(data.level ?? 1);

        setXp(data.xp ?? 0);

        setPreSleepBpm(data.preSleepBpm ?? null);

        setBpmConfidence(data.bpmConfidence ?? null);

        setLastStreakDateKey(data.lastStreakDateKey ?? null);

      }

      const achievements =
        await loadUnlockedAchievements();

      setUnlockedAchievements(
        achievements
      );

      const history =
        await getSleepHistory();

      setSleepHistory(history);

      // La ultima sesion guardada sobrevive reinicios (history[0] = mas nueva)
      setLastSleepSession(history?.[0] ?? null);

      setLastSleepHours(history?.[0]?.hours ?? 0);

      const currentSleep =
        await getCurrentSleepSession();

      if (
        currentSleep &&
        currentSleep.active &&
        currentSleep.startTime
      ) {

        const lang =
          data?.language ?? "en";

        const t = getTranslations(lang);

        setSleepSessionStarted(true);

        setUnlockCount(
          currentSleep.unlockCount ?? 0
        );

        setUnlockTimes(
          currentSleep.unlockTimes ?? []
        );

        setPreSleepBpm(currentSleep.preSleepBpm ?? null);

        setBpmConfidence(currentSleep.bpmConfidence ?? null);

        startNotification(
          currentSleep.startTime,
          t.notificationChannel,
          t.notificationChannelDescription,
          t.notificationTitle,
          t.notificationRunning,
          t.notificationTime,
          t.notificationUnlocks,
          true
        );

        setSleepActive(true);

      } else {
        setSleepActive(false);
      }

      // ===========================
      // Decaimiento de felicidad por tiempo:
      // al abrir la app se resta según las horas sin dormir.
      // Si hay sesión activa, el decaimiento solo cuenta hasta
      // el inicio de la sesión (dormir cuida a la mascota).
      // ===========================

      const lastUpdate =
        data?.lastHappinessUpdate ?? Date.now();

      let decayCap = Date.now();

      if (
        currentSleep &&
        currentSleep.active &&
        currentSleep.startTime
      ) {
        decayCap = currentSleep.startTime;
      }

      const elapsedHours = Math.max(
        0,
        (decayCap - lastUpdate) / 3600000
      );

      setPetHappiness(
        decayPetHappiness(
          data?.petHappiness ?? 100,
          elapsedHours
        )
      );

      setLastHappinessUpdate(Date.now());

      setLoading(false);

    }

    loadData();

  }, []);

  // ===========================
  // Guardado automático
  // ===========================

  useEffect(() => {

    if (loading) return;

    saveAppData({

      coins,

      streak,

      petMood,

      petHappiness,

      lastHappinessUpdate,

      userName,

      petNames,

      userAge,

      goalHours,

      goalType,

      selectedPet,

      ownedPets,

      language,

      level,

      xp,

      preSleepBpm,

      bpmConfidence,

      lastStreakDateKey,

    });

    saveUnlockedAchievements(
      unlockedAchievements
    );

  }, [

    loading,

    coins,

    streak,

    petMood,

    petHappiness,

    lastHappinessUpdate,

    userName,

    petNames,

    userAge,

    goalHours,

    goalType,

    selectedPet,

    ownedPets,

    language,

    level,

      xp,

      unlockedAchievements,

      preSleepBpm,

      bpmConfidence,

      lastStreakDateKey,

  ]);

  // ===========================
  // Recordatorio para dormir
  // ===========================

  useEffect(() => {

    if (loading) return;

    (async () => {

      const settings = await getReminderSettings();

      if (settings && settings.enabled) {

        const t = getTranslations(language);

        scheduleReminder(

          settings.hour,

          settings.minute,

          t.reminderChannel,

          t.reminderChannelDescription,

          t.reminderTitle,

          t.reminderContent,

          t.reminderFollowUpTitle,

          t.reminderFollowUpContent

        );

      }

    })();

  }, [loading, language]);

  // ===========================
  // Escuchar desbloqueo
  // ===========================


  useEffect(() => {

    startAccessibilityListener(() => {

      setUnlockCount(current => {

        if (!sleepSessionStarted) {
          return current;
        }

        return current + 1;

      });

      setUnlockTimes(current => {

        if (!sleepSessionStarted) {
          return current;
        }

        return [
          ...current,
          new Date().getTime(),
        ];

      });

    });

    return () => {

      stopAccessibilityListener();

    };

  }, [sleepSessionStarted]);

  // ===========================
  // Persistir estado de la sesión
  // ===========================

  useEffect(() => {

    if (loading) return;

    if (!sleepSessionStarted) return;

    updateUnlockState(unlockCount, unlockTimes);

  }, [
    loading,
    sleepSessionStarted,
    unlockCount,
    unlockTimes,
  ]);

  // ===========================
  // Sincronizar conteo en la notificación
  // ===========================

  useEffect(() => {

    if (!sleepSessionStarted) return;

    updateUnlocks(unlockCount);

  }, [
    sleepSessionStarted,
    unlockCount,
  ]);

  // ===========================
  // Sincronizar estado de sueño con recordatorios
  // ===========================

  useEffect(() => {

    if (loading) return;

    setSleepActive(sleepSessionStarted);

  }, [loading, sleepSessionStarted]);




    // ===========================
  // Context
  // ===========================

  const value = {

    loading,

    // Perfil

    userName,
    setUserName,

    petNames,
    setPetNames,

    userAge,
    setUserAge,

    goalHours,
    setGoalHours,

    goalType,
    setGoalType,

    selectedPet,
    setSelectedPet,

    ownedPets,
    setOwnedPets,

    language,
    setLanguage,

    // ===========================
    // Logros
    // ===========================

    unlockedAchievements,
    setUnlockedAchievements,

    achievementPopup,
    setAchievementPopup,

    // ===========================
    // Mascota
    // ===========================

    petMood,
    setPetMood,

    petHappiness,
    setPetHappiness,

    lastHappinessUpdate,
    setLastHappinessUpdate,

    // ===========================
    // Economía
    // ===========================

    coins,
    setCoins,

    // ===========================
    // Nivel
    // ===========================

    level,
    setLevel,

    xp,
    setXp,

    // ===========================
    // Racha
    // ===========================

    streak,
    setStreak,

    // ===========================
    // Historial
    // ===========================

    sleepHistory,
    setSleepHistory,

    // ===========================
    // Última sesión
    // ===========================

    lastSleepHours,
    setLastSleepHours,

    lastSleepSession,
    setLastSleepSession,

    // ===========================
    // Sleep Session
    // ===========================

    sleepSessionStarted,
    setSleepSessionStarted,

    unlockCount,
    setUnlockCount,

    unlockTimes,
    setUnlockTimes,

    preSleepBpm,
    setPreSleepBpm,

    bpmConfidence,
    setBpmConfidence,

    lastStreakDateKey,
    setLastStreakDateKey,

  };

  return (

    <AppContext.Provider value={value}>

      {children}

    </AppContext.Provider>

  );

}