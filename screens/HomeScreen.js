import React, { useContext } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";

import { AppContext } from "../context/AppContext";
import { COLORS } from "../constants/theme";
import StatCard from "../components/StatCard";
import { PET_IMAGES } from "../constants/PetImages";
import { getTranslations } from "../services/TranslationService";

import ScreenContainer from "../components/ScreenContainer";
import AppText from "../components/AppText";

export default function HomeScreen({ navigation }) {

  const {

    userName,

    streak,

    coins,

    petMood,

    selectedPet,

    level,

    xp,

    language,

  } = useContext(AppContext);

  const t = getTranslations(language);

  function greeting() {

    const hour = new Date().getHours();

    if (hour < 12) return t.greetingMorning;

    if (hour < 18) return t.greetingAfternoon;

    return t.greetingEvening;

  }

  function moodText() {

    switch (petMood) {

      case "happy":
        return t.happy;

      case "normal":
        return t.normal;

      case "sleepy":
        return t.sleepy;

      default:
        return t.sad;

    }

  }

  return (

    <ScreenContainer style={styles.screen}>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.header}>

          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => navigation.navigate("PetShop")}
          >

            <AppText style={styles.menuIcon}>
              🏪
            </AppText>

          </TouchableOpacity>

          <View style={styles.headerCenter}>

            <AppText
              color={COLORS.textSecondary}
              style={styles.greeting}
            >
              {greeting()}
            </AppText>

            <AppText style={styles.name}>
              {userName || "Player"} 👋
            </AppText>

          </View>

          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => navigation.navigate("Menu")}
          >

            <AppText style={styles.menuIcon}>
              ☰
            </AppText>

          </TouchableOpacity>

        </View>

        <Image
          source={PET_IMAGES[selectedPet][petMood]}
          style={styles.pet}
        />

        <View style={styles.grid}>

          <StatCard
            icon="🔥"
            label={t.streak}
            value={`${streak} ${t.days}`}
          />

          <StatCard
            icon="💰"
            label={t.coins}
            value={`${coins}`}
          />

          <View style={styles.levelCard}>

            <AppText style={styles.levelIcon}>
              ⭐
            </AppText>

            <AppText
              color={COLORS.textSecondary}
              style={styles.levelLabel}
            >
              {t.level}
            </AppText>

            <AppText style={styles.levelValue}>
              {level}
            </AppText>

            <View style={styles.levelBarBackground}>

              <View
                style={[
                  styles.levelBarFill,
                  {
                    width: `${xp}%`,
                  },
                ]}
              />

            </View>

            <AppText
              color={COLORS.textSecondary}
              style={styles.levelXp}
            >
              {xp} / 100 {t.xp}
            </AppText>

          </View>

          <StatCard
            icon="😊"
            label={t.mood}
            value={moodText()}
          />

        </View>

      </ScrollView>

      <View style={styles.bottomContainer}>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => navigation.navigate("SleepMode")}
        >

          <AppText style={styles.startText}>
            🌙 {t.startSleep.toUpperCase()}
          </AppText>

        </TouchableOpacity>

      </View>

    </ScreenContainer>

  );

}
const styles = StyleSheet.create({

  screen: {
    padding: 0,
  },

  content: {
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 130,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  headerCenter: {
    flex: 1,
    marginHorizontal: 15,
  },

  greeting: {
    fontSize: 17,
  },

  name: {
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 4,
  },

  circleButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },

  menuIcon: {
    color: "white",
    fontSize: 24,
  },

  pet: {
    width: 190,
    height: 190,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 20,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  levelCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 18,
    alignItems: "center",
    elevation: 4,
    marginBottom: 18,
  },

  levelIcon: {
    fontSize: 42,
  },

  levelLabel: {
    fontSize: 18,
    marginTop: 8,
  },

  levelValue: {
    fontSize: 34,
    fontWeight: "bold",
    marginVertical: 6,
  },

  levelBarBackground: {
    width: "100%",
    height: 8,
    backgroundColor: "#E5E5E5",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 8,
  },

  levelBarFill: {
    height: 8,
    backgroundColor: COLORS.primary,
  },

  levelXp: {
    marginTop: 8,
    fontSize: 12,
  },

  bottomContainer: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 25,
  },

  startButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    elevation: 6,
  },

  startText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 22,
  },

});
