import React, {
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import {
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppContext } from "../context/AppContext";
import { getTranslations } from "../services/TranslationService";
import { NIGHT } from "../constants/theme";

import {
  clearAppData,
} from "../storage/AppStorage";

import {
  clearSleepHistory,
} from "../storage/SleepStorage";

import {
  clearUnlockedAchievements,
} from "../storage/AchievementStorage";

import {
  getReminderSettings,
  saveReminderSettings,
} from "../storage/ReminderStorage";

import {
  scheduleReminder,
  cancelReminder,
  canScheduleExact,
  openExactAlarmSettings,
} from "../services/ReminderService";

import NightBackground from "../components/NightBackground";
import Card from "../components/Card";
import AppText from "../components/AppText";
import AppIcon from "../components/AppIcon";
import BottomNav from "../components/BottomNav";
import SwipeableTabScreen from "../components/SwipeableTabScreen";

import Constants from "expo-constants";
import styles from "./styles/SettingsScreen.styles";

const APP_VERSION =
  Constants.expoConfig?.version ||
  Constants.nativeAppVersion ||
  "1.0.0";

function wrapValue(value, direction, min, max) {
  if (direction > 0) {
    return value >= max ? min : value + 1;
  }
  return value <= min ? max : value - 1;
}

function TimeSelector({ hour, minute, hourLabel, minuteLabel, onStep }) {

  const [field, setField] = useState("hour");

  const fieldRef = useRef(field);
  fieldRef.current = field;

  const timer = useRef(null);

  useEffect(() => () => clearHold(), []);

  function clearHold() {
    if (timer.current) {
      clearTimeout(timer.current.timeout);
      clearInterval(timer.current.interval);
      timer.current = null;
    }
  }

  function step(direction) {
    onStep(fieldRef.current, direction);
  }

  function pressIn(direction) {
    step(direction);
    const timeout = setTimeout(() => {
      timer.current.interval = setInterval(() => step(direction), 110);
    }, 350);
    timer.current = { timeout, interval: null };
  }

  const hourActive = field === "hour";
  const minuteActive = field === "minute";

  return (
    <View style={styles.timeContainer}>

      <View style={styles.timeLabels}>
        <AppText style={styles.timeFieldLabel}>{hourLabel}</AppText>
        <View style={styles.timeLabelsSpacer} />
        <AppText style={styles.timeFieldLabel}>{minuteLabel}</AppText>
      </View>

      <View style={styles.timePill}>

        <TouchableOpacity
          style={styles.timeBtn}
          onPressIn={() => pressIn(-1)}
          onPressOut={clearHold}
        >
          <AppText style={styles.timeBtnText}>−</AppText>
        </TouchableOpacity>

        <View style={styles.timeValues}>

          <TouchableOpacity
            style={[styles.timeField, hourActive && styles.timeFieldActive]}
            onPress={() => setField("hour")}
          >
            <AppText style={styles.timeValue}>
              {String(hour).padStart(2, "0")}
            </AppText>
          </TouchableOpacity>

          <AppText style={styles.timeColon}>:</AppText>

          <TouchableOpacity
            style={[styles.timeField, minuteActive && styles.timeFieldActive]}
            onPress={() => setField("minute")}
          >
            <AppText style={styles.timeValue}>
              {String(minute).padStart(2, "0")}
            </AppText>
          </TouchableOpacity>

        </View>

        <TouchableOpacity
          style={styles.timeBtn}
          onPressIn={() => pressIn(1)}
          onPressOut={clearHold}
        >
          <AppText style={styles.timeBtnText}>+</AppText>
        </TouchableOpacity>

      </View>

    </View>
  );
}

export default function SettingsScreen({ navigation }) {

  const {

    language,
    setLanguage,

    setCoins,
    setStreak,

    setLevel,
    setXp,

    setPetMood,
    setPetHappiness,
    setLastHappinessUpdate,

    setUserName,
    setUserAge,

    setGoalHours,
    setGoalType,

    setSelectedPet,
    setOwnedPets,

    setSleepHistory,

    setUnlockedAchievements,

    setLastSleepHours,
    setLastSleepSession,

  } = useContext(AppContext);

  const t = getTranslations(language);

  const appear = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(appear, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [appear]);

  const [reminder, setReminder] = useState({
    enabled: false,
    hour: 22,
    minute: 30,
  });

  const [exactAlarmOk, setExactAlarmOk] = useState(true);

  const reminderRef = useRef({
    enabled: false,
    hour: 22,
    minute: 30,
  });

  useEffect(() => {
    (async () => {
      const settings = await getReminderSettings();
      reminderRef.current = settings;
      setReminder(settings);
    })();
  }, []);

  function checkExactAlarm() {
    canScheduleExact()
      .then(setExactAlarmOk)
      .catch(() => setExactAlarmOk(true));
  }

  useEffect(() => {
    checkExactAlarm();
    const unsubscribe = navigation.addListener(
      "focus",
      checkExactAlarm
    );
    return unsubscribe;
  }, [navigation]);

  function applyReminder(next) {
    reminderRef.current = next;
    setReminder(next);
    saveReminderSettings(next);
    if (next.enabled) {
      scheduleReminder(
        next.hour,
        next.minute,
        t.reminderChannel,
        t.reminderChannelDescription,
        t.reminderTitle,
        t.reminderContent,
        t.reminderFollowUpTitle,
        t.reminderFollowUpContent
      );
    } else {
      cancelReminder();
    }
  }

  function stepTime(field, direction) {
    const prev = reminderRef.current;
    const next =
      field === "hour"
        ? { ...prev, hour: wrapValue(prev.hour, direction, 0, 23) }
        : { ...prev, minute: wrapValue(prev.minute, direction, 0, 59) };

    reminderRef.current = next;
    setReminder(next);
    saveReminderSettings(next);
    if (next.enabled) {
      scheduleReminder(
        next.hour,
        next.minute,
        t.reminderChannel,
        t.reminderChannelDescription,
        t.reminderTitle,
        t.reminderContent,
        t.reminderFollowUpTitle,
        t.reminderFollowUpContent
      );
    } else {
      cancelReminder();
    }
  }

  function resetProgress() {

    Alert.alert(

      t.resetProgress,

      t.resetConfirmation ||
        "Are you sure? This action cannot be undone.",

      [

        {
          text: t.cancel || "Cancel",
          style: "cancel",
        },

        {

          text: t.resetProgress,

          style: "destructive",

          onPress: async () => {

            // Borra todo el almacenamiento
            await clearAppData();
            await clearSleepHistory();
            await clearUnlockedAchievements();
            cancelReminder();
            setReminder({
              enabled: false,
              hour: 22,
              minute: 30,
            });

            // Reinicia el contexto
            setCoins(0);
            setStreak(0);

            setLevel(1);
            setXp(0);

            setPetMood("happy");
            setPetHappiness(100);
            setLastHappinessUpdate(Date.now());

            setUserName("");
            setUserAge(null);

            setGoalHours(8);
            setGoalType("");

            setSelectedPet("cat");
            setOwnedPets(["cat"]);

            setSleepHistory([]);
            setUnlockedAchievements([]);

            setLastSleepHours(0);
            setLastSleepSession(null);

            Alert.alert(

              t.success || "Success",

              t.progressReset || "Progress has been reset.",

              [

                {

                  text: t.ok || "OK",

                  onPress: () => {

                    navigation.reset({

                      index: 0,

                      routes: [

                        {

                          name: "Welcome",

                        },

                      ],

                    });

                  },

                },

              ]

            );

          },

        },

      ]

    );

  }

  const fadeOpacity = appear.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const fadeTranslate = appear.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  return (

    <SwipeableTabScreen active="Settings" navigation={navigation}>

    <NightBackground moon={false}>

      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >

          <Animated.View
            style={{
              opacity: fadeOpacity,
              transform: [{ translateY: fadeTranslate }],
            }}
          >

            {/* Header */}

            <View style={styles.header}>

              <View style={styles.headerIconBox}>
                <AppIcon name="settings" size={26} color={NIGHT.yellow} />
              </View>

              <View style={styles.headerText}>

                <AppText style={styles.title}>
                  {t.settings}
                </AppText>

                <AppText style={styles.subtitle}>
                  {t.settingsSubtitle}
                </AppText>

              </View>

            </View>

            {/* Idioma */}

            <Card style={styles.card}>

              <View style={styles.cardHeaderRow}>

                <View style={styles.iconCircle}>
                  <AppIcon name="language" size={20} color={NIGHT.end} />
                </View>

                <View style={styles.cardHeaderText}>

                  <AppText style={styles.cardTitle}>
                    {t.language}
                  </AppText>

                  <AppText style={styles.cardDesc}>
                    {t.languageDesc}
                  </AppText>

                </View>

              </View>

              <View style={styles.buttons}>

                <TouchableOpacity
                  style={[
                    styles.languageButton,
                    language === "en" && styles.selectedButton,
                  ]}
                  onPress={() => setLanguage("en")}
                >

                  <AppText
                    style={[
                      styles.buttonText,
                      language === "en" && styles.buttonTextSelected,
                    ]}
                  >
                    English
                  </AppText>

                  {
                    language === "en" && (
                      <AppIcon
                        name="check"
                        size={14}
                        color="#FFFFFF"
                        style={styles.buttonCheck}
                      />
                    )
                  }

                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.languageButton,
                    language === "es" && styles.selectedButton,
                  ]}
                  onPress={() => setLanguage("es")}
                >

                  <AppText
                    style={[
                      styles.buttonText,
                      language === "es" && styles.buttonTextSelected,
                    ]}
                  >
                    Español
                  </AppText>

                  {
                    language === "es" && (
                      <AppIcon
                        name="check"
                        size={14}
                        color="#FFFFFF"
                        style={styles.buttonCheck}
                      />
                    )
                  }

                </TouchableOpacity>

              </View>

            </Card>

            {/* Recordatorio */}

            <Card style={styles.card}>

              <View style={styles.cardHeaderRow}>

                <View style={styles.iconCircle}>
                  <AppIcon name="reminder" size={20} color={NIGHT.end} />
                </View>

                <View style={styles.cardHeaderText}>

                  <AppText style={styles.cardTitle}>
                    {t.sleepReminder}
                  </AppText>

                  <AppText style={styles.cardDesc}>
                    {t.sleepReminderDesc}
                  </AppText>

                </View>

                <Switch
                  value={reminder.enabled}
                  onValueChange={(value) =>
                    applyReminder({
                      ...reminder,
                      enabled: value,
                    })
                  }
                  trackColor={{
                    true: NIGHT.end,
                    false: "#D0D0D0",
                  }}
                  thumbColor="#FFFFFF"
                />

              </View>

              {
                reminder.enabled && (
                  <TimeSelector
                    hour={reminder.hour}
                    minute={reminder.minute}
                    hourLabel={t.reminderHour}
                    minuteLabel={t.reminderMinute}
                    onStep={stepTime}
                  />
                )
              }

              {/* Mensaje motivacional */}

              <View style={styles.motivationalBox}>

                <AppIcon name="night" size={26} color={NIGHT.yellow} style={styles.motivationalIcon} />

                <AppText style={styles.motivationalTitle}>
                  {t.sleepBetterTitle}
                </AppText>

                <AppText style={styles.motivationalMessage}>
                  {t.sleepBetterMessage}
                </AppText>

              </View>

              {
                reminder.enabled && !exactAlarmOk && (
                  <TouchableOpacity
                    style={styles.exactAlarmLink}
                    onPress={openExactAlarmSettings}
                  >

                    <AppIcon name="reminder" size={16} color={NIGHT.yellow} style={styles.exactAlarmIcon} />

                    <AppText style={styles.exactAlarmText}>
                      {t.exactAlarmHint}
                    </AppText>

                  </TouchableOpacity>
                )
              }

            </Card>

            {/* Reiniciar progreso */}

            <TouchableOpacity
              style={styles.optionCard}
              onPress={resetProgress}
            >

              <View style={[styles.iconCircle, styles.resetCircle]}>
                <AppIcon name="reset" size={20} color="#F05A7A" />
              </View>

              <View style={styles.optionText}>

                <AppText style={styles.optionTitle}>
                  {t.resetProgress}
                </AppText>

                <AppText style={styles.optionDesc}>
                  {t.resetDesc}
                </AppText>

              </View>

              <AppIcon name="chevron" size={18} color="#9AA0B8" />

            </TouchableOpacity>

            {/* Acerca de SleepPet */}

            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => navigation.navigate("About")}
            >

              <View style={styles.iconCircle}>
                <AppIcon name="about" size={20} color={NIGHT.end} />
              </View>

              <View style={styles.optionText}>

                <AppText style={styles.optionTitle}>
                  {t.about}
                </AppText>

                <AppText style={styles.optionDesc}>
                  {t.version} {APP_VERSION}
                </AppText>

              </View>

              <AppIcon name="chevron" size={18} color="#9AA0B8" />

            </TouchableOpacity>

          </Animated.View>

        </ScrollView>

        {/* Navegación inferior */}

        <View style={styles.bottomNav}>
          <BottomNav
            active="Settings"
            navigation={navigation}
          />
        </View>

      </SafeAreaView>

    </NightBackground>

    </SwipeableTabScreen>

  );

}
