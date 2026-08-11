import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";

import { AppContext } from "../context/AppContext";
import { getTranslations } from "../services/TranslationService";
import { COLORS, FONT } from "../constants/theme";

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
} from "../services/ReminderService";

function TimeStepper({ label, value, min, max, onChange }) {

  function stepUp() {
    onChange(value >= max ? min : value + 1);
  }

  function stepDown() {
    onChange(value <= min ? max : value - 1);
  }

  return (
    <View style={styles.stepperCol}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperRow}>
        <TouchableOpacity
          style={styles.stepperBtn}
          onPress={stepDown}
        >
          <Text style={styles.stepperBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.stepperValue}>
          {String(value).padStart(2, "0")}
        </Text>
        <TouchableOpacity
          style={styles.stepperBtn}
          onPress={stepUp}
        >
          <Text style={styles.stepperBtnText}>+</Text>
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

  const [reminder, setReminder] = useState({
    enabled: false,
    hour: 22,
    minute: 30,
  });

  useEffect(() => {
    (async () => {
      const settings = await getReminderSettings();
      setReminder(settings);
    })();
  }, []);

  function applyReminder(next) {
    setReminder(next);
    saveReminderSettings(next);
    if (next.enabled) {
      scheduleReminder(
        next.hour,
        next.minute,
        t.reminderChannel,
        t.reminderChannelDescription,
        t.reminderTitle,
        t.reminderContent
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

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        ⚙️ {t.settings}
      </Text>

      {/* Language */}

      <View style={styles.card}>

        <Text style={styles.cardTitle}>
          🌐 {t.language}
        </Text>

        <View style={styles.buttons}>

          <TouchableOpacity
            style={[
              styles.languageButton,
              language === "en" && styles.selectedButton,
            ]}
            onPress={() => setLanguage("en")}
          >

            <Text style={styles.buttonText}>
              🇺🇸 English
            </Text>

          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.languageButton,
              language === "es" && styles.selectedButton,
            ]}
            onPress={() => setLanguage("es")}
          >

            <Text style={styles.buttonText}>
              🇪🇸 Español
            </Text>

          </TouchableOpacity>

        </View>

      </View>

      {/* Bedtime reminder */}

      <View style={styles.card}>

        <Text style={styles.cardTitle}>
          ⏰ {t.sleepReminder}
        </Text>

        <Text style={styles.cardDesc}>
          {t.sleepReminderDesc}
        </Text>

        <TouchableOpacity
          style={[
            styles.toggle,
            reminder.enabled && styles.toggleOn,
          ]}
          onPress={() =>
            applyReminder({
              ...reminder,
              enabled: !reminder.enabled,
            })
          }
        >
          <Text style={styles.toggleText}>
            {reminder.enabled
              ? `✅ ${t.reminderOn}`
              : `⏸ ${t.reminderOff}`}
          </Text>
        </TouchableOpacity>

        {
          reminder.enabled && (
            <View style={styles.timeRow}>

              <TimeStepper
                label={t.reminderHour}
                value={reminder.hour}
                min={0}
                max={23}
                onChange={(hour) =>
                  applyReminder({
                    ...reminder,
                    hour,
                  })
                }
              />

              <Text style={styles.colon}>:</Text>

              <TimeStepper
                label={t.reminderMinute}
                value={reminder.minute}
                min={0}
                max={59}
                onChange={(minute) =>
                  applyReminder({
                    ...reminder,
                    minute,
                  })
                }
              />

            </View>
          )
        }

      </View>

      {/* Reset */}

      <TouchableOpacity
        style={styles.card}
        onPress={resetProgress}
      >

        <Text style={styles.cardTitle}>
          🗑 {t.resetProgress}
        </Text>

      </TouchableOpacity>

      {/* About */}

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("About")}
      >

        <Text style={styles.cardTitle}>
          ℹ️ {t.about}
        </Text>

      </TouchableOpacity>

      <Text style={styles.version}>
        SleepPet v1.0
      </Text>

    </View>

  );

}
const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },

  title: {
    fontSize: FONT.title,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
    marginVertical: 25,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 15,
  },

  cardDesc: {
    color: COLORS.textSecondary,
    fontSize: 15,
    marginBottom: 15,
  },

  toggle: {
    backgroundColor: "#EAEAEA",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },

  toggleOn: {
    backgroundColor: COLORS.success,
  },

  toggleText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },

  colon: {
    fontSize: 30,
    fontWeight: "bold",
    color: COLORS.text,
    marginHorizontal: 4,
  },

  stepperCol: {
    alignItems: "center",
    marginHorizontal: 10,
  },

  stepperLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },

  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  stepperBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  stepperBtnText: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
  },

  stepperValue: {
    minWidth: 56,
    textAlign: "center",
    fontSize: 30,
    fontWeight: "bold",
    color: COLORS.text,
  },

  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  languageButton: {
    flex: 1,
    backgroundColor: "#EAEAEA",
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
    alignItems: "center",
  },

  selectedButton: {
    backgroundColor: COLORS.primary,
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  version: {
    textAlign: "center",
    marginTop: 30,
    color: COLORS.textSecondary,
    fontSize: 15,
  },

});