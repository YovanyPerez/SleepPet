import React, { useContext } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { AppContext } from "../context/AppContext";
import { getTranslations } from "../services/TranslationService";
import { COLORS } from "../constants/theme";

import ScreenContainer from "../components/ScreenContainer";
import AppText from "../components/AppText";

export default function MenuScreen({ navigation }) {

  const { language } = useContext(AppContext);

  const t = getTranslations(language);

  return (

    <ScreenContainer style={styles.container}>

      <AppText
        variant="title"
        center
      >
        📂 {t.menu}
      </AppText>

      <AppText
        color={COLORS.textSecondary}
        style={styles.subtitle}
      >
        {t.chooseDestination}
      </AppText>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("Profile")}
      >

        <AppText style={styles.icon}>👤</AppText>

        <View style={styles.textContainer}>

          <AppText style={styles.cardTitle}>
            {t.myProfile}
          </AppText>

          <AppText
            color={COLORS.textSecondary}
            style={styles.cardSubtitle}
          >
            {t.viewProfile}
          </AppText>

        </View>

      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("History")}
      >

        <AppText style={styles.icon}>📅</AppText>

        <View style={styles.textContainer}>

          <AppText style={styles.cardTitle}>
            {t.sleepHistory}
          </AppText>

          <AppText
            color={COLORS.textSecondary}
            style={styles.cardSubtitle}
          >
            {t.viewSleepHistory}
          </AppText>

        </View>

      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("Statistics")}
      >

        <AppText style={styles.icon}>📊</AppText>

        <View style={styles.textContainer}>

          <AppText style={styles.cardTitle}>
            {t.statistics}
          </AppText>

          <AppText
            color={COLORS.textSecondary}
            style={styles.cardSubtitle}
          >
            {t.checkProgress}
          </AppText>

        </View>

      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("Achievements")}
      >

        <AppText style={styles.icon}>🏆</AppText>

        <View style={styles.textContainer}>

          <AppText style={styles.cardTitle}>
            {t.achievements}
          </AppText>

          <AppText
            color={COLORS.textSecondary}
            style={styles.cardSubtitle}
          >
            {t.viewAchievements}
          </AppText>

        </View>

      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("Settings")}
      >

        <AppText style={styles.icon}>⚙️</AppText>

        <View style={styles.textContainer}>

          <AppText style={styles.cardTitle}>
            {t.settings}
          </AppText>

          <AppText
            color={COLORS.textSecondary}
            style={styles.cardSubtitle}
          >
            {t.customizeApp}
          </AppText>

        </View>

      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >

        <AppText style={styles.backText}>
          ← {t.backHome}
        </AppText>

      </TouchableOpacity>

    </ScreenContainer>

  );

}

const styles = StyleSheet.create({

  container: {
    padding: 25,
    justifyContent: "center",
  },

  subtitle: {
    textAlign: "center",
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
  },

  cardSubtitle: {
    marginTop: 5,
    fontSize: 15,
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
