import React, { useContext } from "react";
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