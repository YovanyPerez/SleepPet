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
  Modal,
  TextInput,
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
import {
  getSmartAlarmSettings,
  saveSmartAlarmSettings,
} from "../storage/SmartAlarmStorage";
import {
  setSmartAlarmConfig,
} from "../services/SmartAlarmService";

import NightBackground from "../components/NightBackground";
import TimeSelector, { wrapValue } from "../components/TimeSelector";
import AppText from "../components/AppText";
import AppIcon from "../components/AppIcon";

import Constants from "expo-constants";
import styles from "./styles/SettingsScreen.styles";

const APP_VERSION =
  Constants.expoConfig?.version ||
  Constants.nativeAppVersion ||
  "1.0.0";

export default function SettingsScreen({ navigation }) {

  const {

    language,
    setLanguage,

    setCoins,
    setStreak,

    setStreakShields,

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

    setLastStreakDateKey,

    setLastHappinessAlertKey,

    setHasCompletedOnboarding,

    setHasAcceptedTerms,

    setHasSeenPPGTutorial,

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

  // Ventana de confirmación de borrado (escribir palabra localizada)
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [resetText, setResetText] = useState("");

  const reminderRef = useRef({
    enabled: false,
    hour: 22,
    minute: 30,
  });

  const [smartAlarm, setSmartAlarm] = useState({
    enabled: false,
    hour: 7,
    minute: 0,
    windowMin: 30,
    dismissMode: "off",
  });
  const smartAlarmRef = useRef({
    enabled: false,
    hour: 7,
    minute: 0,
    windowMin: 30,
    dismissMode: "off",
  });

  useEffect(() => {
    (async () => {
      const settings = await getReminderSettings();
      reminderRef.current = settings;
      setReminder(settings);
      const smart = await getSmartAlarmSettings();
      smartAlarmRef.current = smart;
      setSmartAlarm(smart);
      // sincroniza a nativo (SharedPreferences smart_alarm)
      setSmartAlarmConfig(smart, language).catch(() => {});
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

  function ExactAlarmLink() {
    if (exactAlarmOk) return null;
    return (
      <TouchableOpacity
        style={styles.exactAlarmLink}
        onPress={openExactAlarmSettings}
      >
        <AppIcon name="reminder" size={16} color={NIGHT.yellow} style={styles.exactAlarmIcon} />
        <AppText style={styles.exactAlarmText}>
          {t.exactAlarmHint}
        </AppText>
      </TouchableOpacity>
    );
  }

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

  function applySmartAlarm(next) {
    smartAlarmRef.current = next;
    setSmartAlarm(next);
    saveSmartAlarmSettings(next);
    setSmartAlarmConfig(next, language).catch(() => {});
  }

  function stepSmartTime(field, direction) {
    const prev = smartAlarmRef.current;
    const next =
      field === "hour"
        ? { ...prev, hour: wrapValue(prev.hour, direction, 0, 23) }
        : { ...prev, minute: wrapValue(prev.minute, direction, 0, 59) };
    smartAlarmRef.current = next;
    setSmartAlarm(next);
    saveSmartAlarmSettings(next);
    setSmartAlarmConfig(next, language).catch(() => {});
  }

  // La palabra cambia según idioma (CONFIRMAR/CONFIRM); match insensible
  // a mayúsculas y espacios para no castigar el teclado
  const resetConfirmOk =
    resetText.trim().toUpperCase() === (t.resetConfirmWord ?? "CONFIRMAR");

  function resetProgress() {
    setResetText("");
    setResetModalVisible(true);
  }

  async function confirmResetProgress() {
    if (!resetConfirmOk) return;
    setResetModalVisible(false);

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

            setStreakShields(0);

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

            setLastStreakDateKey(null);

            setLastHappinessAlertKey(null);

            setHasCompletedOnboarding(false);

            setHasAcceptedTerms(false);

            setHasSeenPPGTutorial(false);

            Alert.alert(

              t.success,

              t.progressReset,

              [

                {

                  text: t.ok,

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

            <View style={styles.card}>

              <View style={styles.cardHeaderRow}>

                <View style={styles.iconCircle}>
                  <AppIcon name="language" size={20} color={NIGHT.yellow} />
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

            </View>

            {/* Recordatorio */}

            <View style={styles.card}>

              <View style={styles.cardHeaderRow}>

                <View style={styles.iconCircle}>
                  <AppIcon name="reminder" size={20} color={NIGHT.yellow} />
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

              {reminder.enabled && <ExactAlarmLink />}

            </View>

            {/* Smart Alarm */}
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.iconCircle}>
                  <AppIcon name="night" size={20} color={NIGHT.yellow} />
                </View>
                <View style={styles.cardHeaderText}>
                  <AppText style={styles.cardTitle}>
                    {t.smartAlarmTitle ?? "Smart Alarm"}
                  </AppText>
                  <AppText style={styles.cardDesc}>
                    {t.smartAlarmDesc ?? "Despertar en fase ligera dentro de ventana"}
                  </AppText>
                </View>
                <Switch
                  value={smartAlarm.enabled}
                  onValueChange={(value) =>
                    applySmartAlarm({
                      ...smartAlarm,
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
              {smartAlarm.enabled && (
                <>
                  <TimeSelector
                    hour={smartAlarm.hour}
                    minute={smartAlarm.minute}
                    hourLabel={t.reminderHour}
                    minuteLabel={t.reminderMinute}
                    onStep={stepSmartTime}
                  />
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                    {[15, 30, 45].map((w) => (
                      <TouchableOpacity
                        key={w}
                        style={[
                          styles.languageButton,
                          { flex: 1, paddingVertical: 10 },
                          smartAlarm.windowMin === w && styles.selectedButton,
                        ]}
                        onPress={() => applySmartAlarm({ ...smartAlarm, windowMin: w })}
                      >
                        <AppText
                          style={[
                            styles.buttonText,
                            smartAlarm.windowMin === w && styles.buttonTextSelected,
                          ]}
                        >
                          {w} min
                        </AppText>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.motivationalBox}>
                    <AppText style={styles.motivationalTitle}>
                      {t.smartAlarmWindowHint ?? "Ventana favorable"}
                    </AppText>
                    <AppText style={styles.motivationalMessage}>
                      {(t.smartAlarmWindowDesc ?? "Si tu sueño está en fase ligera entre {{start}} y {{end}}, SmartAlarm intentará despertarte en momento favorable.").replace("{{start}}", `${String((smartAlarm.hour*60+smartAlarm.minute - smartAlarm.windowMin + 1440)%1440 /60|0).padStart(2,"0")}:${String((smartAlarm.hour*60+smartAlarm.minute - smartAlarm.windowMin)%60).padStart(2,"0")}`).replace("{{end}}", `${String(smartAlarm.hour).padStart(2,"0")}:${String(smartAlarm.minute).padStart(2,"0")}`)}
                    </AppText>
                  </View>
                  <AppText style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, fontFamily: "Nunito_700Bold", marginTop: 14, marginBottom: 8 }}>
                    {t.smartAlarmChallenge ?? "Apagar la alarma"}
                  </AppText>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {[
                      { mode: "off", label: t.smartAlarmChallengeOff ?? "Botón Detener" },
                      { mode: "word", label: t.smartAlarmChallengeWord ?? "Escribir palabra" },
                    ].map((opt) => (
                      <TouchableOpacity
                        key={opt.mode}
                        style={[
                          styles.languageButton,
                          { flex: 1, paddingVertical: 10 },
                          (smartAlarm.dismissMode ?? "off") === opt.mode && styles.selectedButton,
                        ]}
                        onPress={() => applySmartAlarm({ ...smartAlarm, dismissMode: opt.mode })}
                      >
                        <AppText
                          style={[
                            styles.buttonText,
                            (smartAlarm.dismissMode ?? "off") === opt.mode && styles.buttonTextSelected,
                          ]}
                        >
                          {opt.label}
                        </AppText>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <AppText style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, fontFamily: "Nunito_400Regular", marginTop: 6, textAlign: "center" }}>
                    {t.smartAlarmChallengeDesc ?? "Con desafío no hay atajo: suena hasta escribir la palabra."}
                  </AppText>
                  <AppText style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginTop: 8, textAlign: "center" }}>
                    {t.smartAlarmDisclaimer ?? "*Estimación por reglas, no diagnóstico médico. Amanecer siempre a la hora objetivo si no hay momento favorable."}
                  </AppText>
                  <ExactAlarmLink />
                </>
              )}
            </View>

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

              <AppIcon name="chevron" size={18} color="rgba(255,255,255,0.5)" />

            </TouchableOpacity>

            {/* Ver guía (replay manual del onboarding, nunca automático) */}

            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => navigation.navigate("Home", { replayGuide: true })}
            >

              <View style={styles.iconCircle}>
                <AppIcon name="sparkles" size={20} color={NIGHT.yellow} />
              </View>

              <View style={styles.optionText}>

                <AppText style={styles.optionTitle}>
                  {t.settingsGuideTitle}
                </AppText>

                <AppText style={styles.optionDesc}>
                  {t.settingsGuideDesc}
                </AppText>

              </View>

              <AppIcon name="chevron" size={18} color="rgba(255,255,255,0.5)" />

            </TouchableOpacity>

            {/* Acerca de SleepPet */}

            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => navigation.navigate("About")}
            >

              <View style={styles.iconCircle}>
                <AppIcon name="about" size={20} color={NIGHT.yellow} />
              </View>

              <View style={styles.optionText}>

                <AppText style={styles.optionTitle}>
                  {t.about}
                </AppText>

                <AppText style={styles.optionDesc}>
                  {t.version} {APP_VERSION}
                </AppText>

              </View>

              <AppIcon name="chevron" size={18} color="rgba(255,255,255,0.5)" />

            </TouchableOpacity>

          </Animated.View>

        </ScrollView>

        {/* Confirmación de borrado: escribir palabra localizada */}

        <Modal
          visible={resetModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setResetModalVisible(false)}
        >
          <View style={styles.resetOverlay}>
            <View style={styles.resetCard}>

              <View style={styles.resetIconCircle}>
                <AppIcon name="warning" size={24} color="#FF8FAB" />
              </View>

              <AppText style={styles.resetTitle}>
                {t.resetProgress}
              </AppText>

              <AppText style={styles.resetDesc}>
                {t.resetDesc}
              </AppText>

              <AppText style={styles.resetHint}>
                {t.resetTypeHint ?? "Escribe CONFIRMAR para borrar tu progreso"}
              </AppText>

              <TextInput
                style={styles.resetInput}
                value={resetText}
                onChangeText={setResetText}
                placeholder={t.resetConfirmWord ?? "CONFIRMAR"}
                placeholderTextColor="rgba(255,255,255,0.35)"
                autoCapitalize="characters"
                autoCorrect={false}
                returnKeyType="done"
              />

              <View style={styles.resetButtons}>
                <TouchableOpacity
                  style={[styles.resetButton, styles.resetCancel]}
                  onPress={() => setResetModalVisible(false)}
                >
                  <AppText style={styles.resetCancelText}>
                    {t.cancel}
                  </AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.resetButton,
                    styles.resetDelete,
                    !resetConfirmOk && styles.resetDisabled,
                  ]}
                  activeOpacity={resetConfirmOk ? 0.7 : 1}
                  onPress={confirmResetProgress}
                >
                  <AppText style={styles.resetDeleteText}>
                    {t.resetDelete ?? "Borrar todo"}
                  </AppText>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </Modal>

      </SafeAreaView>

    </NightBackground>

  );

}
