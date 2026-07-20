import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { AppContext } from "../context/AppContext";
import { getTranslations } from "../services/TranslationService";
import { COLORS, FONT } from "../constants/theme";

export default function MenuScreen({ navigation }) {

  const { language } = useContext(AppContext);

  const t = getTranslations(language);

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        📂 {t.menu}
      </Text>

      <Text style={styles.subtitle}>
        {t.chooseDestination}
      </Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("Profile")}
      >

        <Text style={styles.icon}>👤</Text>

        <View style={styles.textContainer}>

          <Text style={styles.cardTitle}>
            {t.myProfile}
          </Text>

          <Text style={styles.cardSubtitle}>
            {t.viewProfile}
          </Text>

        </View>

      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("History")}
      >

        <Text style={styles.icon}>📅</Text>

        <View style={styles.textContainer}>

          <Text style={styles.cardTitle}>
            {t.sleepHistory}
          </Text>

          <Text style={styles.cardSubtitle}>
            {t.viewSleepHistory}
          </Text>

        </View>

      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("Statistics")}
      >

        <Text style={styles.icon}>📊</Text>

        <View style={styles.textContainer}>

          <Text style={styles.cardTitle}>
            {t.statistics}
          </Text>

          <Text style={styles.cardSubtitle}>
            {t.checkProgress}
          </Text>

        </View>

      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("Achievements")}
      >

        <Text style={styles.icon}>🏆</Text>

        <View style={styles.textContainer}>

          <Text style={styles.cardTitle}>
            {t.achievements}
          </Text>

          <Text style={styles.cardSubtitle}>
            {t.viewAchievements}
          </Text>

        </View>

      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("Settings")}
      >

        <Text style={styles.icon}>⚙️</Text>

        <View style={styles.textContainer}>

          <Text style={styles.cardTitle}>
            {t.settings}
          </Text>

          <Text style={styles.cardSubtitle}>
            {t.customizeApp}
          </Text>

        </View>

      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >

        <Text style={styles.backText}>
          ← {t.backHome}
        </Text>

      </TouchableOpacity>

    </View>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 25,
    justifyContent: "center",
  },

  title: {
    fontSize: FONT.title,
    fontWeight: "bold",
    color: COLORS.text,
    textAlign: "center",
  },

  subtitle: {
    textAlign: "center",
    color: COLORS.textSecondary,
    fontSize: 17,
    marginTop: 10,
    marginBottom: 40,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
    elevation: 4,
  },

  icon: {
    fontSize: 42,
    marginRight: 20,
  },

  textContainer: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },

  cardSubtitle: {
    marginTop: 5,
    fontSize: 15,
    color: COLORS.textSecondary,
  },

  backButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 20,
    alignItems: "center",
  },

  backText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },

});