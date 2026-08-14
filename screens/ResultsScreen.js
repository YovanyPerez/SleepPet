import React, { useContext } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";

import { AppContext } from "../context/AppContext";
import { COLORS } from "../constants/theme";
import { PET_IMAGES } from "../constants/PetImages";
import {
  getTranslations,
} from "../services/TranslationService";

import ScreenContainer from "../components/ScreenContainer";
import Card from "../components/Card";
import AppText from "../components/AppText";

export default function ResultsScreen({ navigation }) {

  const {

    lastSleepSession,

    selectedPet,

    language,

  } = useContext(AppContext);

  const t = getTranslations(language);

  if (!lastSleepSession) {

    return (

      <ScreenContainer style={styles.container}>

        <AppText style={styles.empty}>
          {t.noSleepSession}
        </AppText>

      </ScreenContainer>

    );

  }

  function getTitle() {

    switch (lastSleepSession.mood) {

      case "happy":
        return t.excellentSleep;

      case "normal":
        return t.goodSleep;

      case "sleepy":
        return t.needMoreRest;

      default:
        return t.trySleepingLonger;

    }

  }

  return (

    <ScreenContainer style={styles.container}>

      <AppText
        variant="title"
        center
        style={styles.title}
      >
        {getTitle()}
      </AppText>

      <Image
        source={PET_IMAGES[selectedPet][lastSleepSession.mood]}
        style={styles.pet}
      />

      <Card style={styles.card}>

        <AppText
          color={COLORS.textSecondary}
          style={styles.label}
        >
          {t.sleepTime}
        </AppText>

        <AppText style={styles.value}>
          {lastSleepSession.hours} {t.hours}
        </AppText>

      </Card>

      <Card style={styles.card}>

        <AppText
          color={COLORS.textSecondary}
          style={styles.label}
        >
          {t.sleepQuality}
        </AppText>

        <AppText style={styles.value}>
          😴 {lastSleepSession.quality}
        </AppText>

      </Card>

      <Card style={styles.card}>

        <AppText
          color={COLORS.textSecondary}
          style={styles.label}
        >
          {t.sleepScore}
        </AppText>

        <AppText style={styles.value}>
          💯 {lastSleepSession.score}/100
        </AppText>

      </Card>

      <Card style={styles.card}>

        <AppText
          color={COLORS.textSecondary}
          style={styles.label}
        >
          📱 {t.phoneUnlocks}
        </AppText>

        <AppText style={styles.value}>
          {lastSleepSession.unlockCount}
        </AppText>

      </Card>

      <Card style={styles.card}>

        <AppText
          color={COLORS.textSecondary}
          style={styles.label}
        >
          ⚠️ {t.penalty}
        </AppText>

        <AppText style={styles.value}>
          {lastSleepSession.penalty > 0
            ? `-${lastSleepSession.penalty}`
            : t.none}
        </AppText>

      </Card>

      <View style={styles.rewardRow}>

        <Card style={styles.rewardCard}>

          <AppText style={styles.rewardIcon}>
            💰
          </AppText>

          <AppText style={styles.rewardValue}>
            +{lastSleepSession.coins}
          </AppText>

          <AppText
            color={COLORS.textSecondary}
            style={styles.rewardLabel}
          >
            {t.coins}
          </AppText>

        </Card>

        <Card style={styles.rewardCard}>

          <AppText style={styles.rewardIcon}>
            ⭐
          </AppText>

          <AppText style={styles.rewardValue}>
            +{lastSleepSession.earnedXP}
          </AppText>

          <AppText
            color={COLORS.textSecondary}
            style={styles.rewardLabel}
          >
            XP
          </AppText>

        </Card>

      </View>

      {lastSleepSession.levelUp && (

        <View style={styles.levelUpCard}>

          <AppText style={styles.levelUpTitle}>
            {t.levelUp}
          </AppText>

          <AppText style={styles.levelUpText}>
            {t.congratulations}
          </AppText>

          <AppText style={styles.levelUpText}>
            {t.youReachedLevel} {lastSleepSession.newLevel}
          </AppText>

        </View>

      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Home")}
      >

        <AppText style={styles.buttonText}>
          {t.continue}
        </AppText>

      </TouchableOpacity>

    </ScreenContainer>

  );

}


const styles = StyleSheet.create({

  container: {
    alignItems: "center",
    justifyContent: "center",
  },

  empty: {
    fontSize: 20,
  },

  title: {
    marginBottom: 15,
  },

  pet: {
    width: 180,
    height: 180,
    resizeMode: "contain",
    marginBottom: 20,
  },

  card: {
    width: "100%",
    padding: 18,
    marginBottom: 15,
    alignItems: "center",
  },

  label: {
    fontSize: 17,
    marginBottom: 5,
  },

  value: {
    fontSize: 24,
    fontWeight: "bold",
  },

  rewardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },

  rewardCard: {
    width: "48%",
    padding: 20,
    alignItems: "center",
    marginBottom: 0,
  },

  rewardIcon: {
    fontSize: 38,
  },

  rewardValue: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 10,
  },

  rewardLabel: {
    marginTop: 6,
    fontSize: 16,
  },

  levelUpCard: {
    width: "100%",
    backgroundColor: "#FFE082",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    elevation: 6,
  },

  levelUpTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#C77700",
    marginBottom: 8,
  },

  levelUpText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#7A5200",
  },

  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 60,
    paddingVertical: 18,
    borderRadius: 20,
    elevation: 5,
  },

  buttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },

});
