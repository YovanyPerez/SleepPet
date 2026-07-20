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

      }

      const achievements =
        await loadUnlockedAchievements();

      setUnlockedAchievements(
        achievements
      );

      const history =
        await getSleepHistory();

      setSleepHistory(history);

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

      userName,

      userAge,

      goalHours,

      goalType,

      selectedPet,

      ownedPets,

      language,

      level,

      xp,

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

    userName,

    userAge,

    goalHours,

    goalType,

    selectedPet,

    ownedPets,

    language,

    level,

    xp,

    unlockedAchievements,

  ]);
    // ===========================
  // Context
  // ===========================

  const value = {

    loading,

    // Perfil

    userName,
    setUserName,

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

  };

  return (

    <AppContext.Provider value={value}>

      {children}

    </AppContext.Provider>

  );

}