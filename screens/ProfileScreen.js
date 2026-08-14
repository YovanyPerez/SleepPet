import React, { useContext } from "react";
import {
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";

import { AppContext } from "../context/AppContext";
import { PET_IMAGES } from "../constants/PetImages";
import { COLORS } from "../constants/theme";

import {
  getTranslations,
} from "../services/TranslationService";

import ScreenContainer from "../components/ScreenContainer";
import Card from "../components/Card";
import AppText from "../components/AppText";

export default function ProfileScreen({ navigation }) {

  const {

    userName,
    userAge,

    goalHours,

    selectedPet,

    petMood,

    level,
    xp,

    coins,

    streak,

    sleepHistory,

    language,

  } = useContext(AppContext);

  const t = getTranslations(language);

  return (

    <ScreenContainer style={styles.screen}>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >

        <AppText
          variant="title"
          center
          style={styles.title}
        >
          👤 {t.myProfile}
        </AppText>

        <Image
          source={PET_IMAGES[selectedPet][petMood]}
          style={styles.pet}
        />

        <Card style={styles.card}>

          <AppText
            color={COLORS.textSecondary}
            style={styles.item}
          >
            👤 {t.name}
          </AppText>

          <AppText style={styles.value}>
            {userName}
          </AppText>

        </Card>

        <Card style={styles.card}>

          <AppText
            color={COLORS.textSecondary}
            style={styles.item}
          >
            🎂 {t.age}
          </AppText>

          <AppText style={styles.value}>
            {userAge}
          </AppText>

        </Card>

        <Card style={styles.card}>

          <AppText
            color={COLORS.textSecondary}
            style={styles.item}
          >
            🌙 {t.sleepGoal}
          </AppText>

          <AppText style={styles.value}>
            {goalHours} {t.hours}
          </AppText>

        </Card>

        <Card style={styles.card}>

          <AppText
            color={COLORS.textSecondary}
            style={styles.item}
          >
            ⭐ {t.level}
          </AppText>

          <AppText style={styles.value}>
            {level}
          </AppText>

        </Card>

        <Card style={styles.card}>

          <AppText
            color={COLORS.textSecondary}
            style={styles.item}
          >
            ⭐ XP
          </AppText>

          <AppText style={styles.value}>
            {xp}/100
          </AppText>

        </Card>

        <Card style={styles.card}>

          <AppText
            color={COLORS.textSecondary}
            style={styles.item}
          >
            💰 {t.coins}
          </AppText>

          <AppText style={styles.value}>
            {coins}
          </AppText>

        </Card>

        <Card style={styles.card}>

          <AppText
            color={COLORS.textSecondary}
            style={styles.item}
          >
            🔥 {t.currentStreak}
          </AppText>

          <AppText style={styles.value}>
            {streak} {t.days}
          </AppText>

        </Card>

        <Card style={styles.card}>

          <AppText
            color={COLORS.textSecondary}
            style={styles.item}
          >
            🌙 {t.totalSleepSessions}
          </AppText>

          <AppText style={styles.value}>
            {sleepHistory.length}
          </AppText>

        </Card>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("EditProfile")}
        >

          <AppText style={styles.buttonText}>
            {t.editProfile}
          </AppText>

        </TouchableOpacity>

      </ScrollView>

    </ScreenContainer>

  );

}

const styles = StyleSheet.create({

  screen: {
    padding: 0,
  },

  container: {
    flex: 1,
    padding: 20,
  },

  title: {
    marginBottom: 20,
  },

  pet: {
    width: 170,
    height: 170,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 20,
  },

  card: {
    padding: 18,
    marginBottom: 15,
  },

  item: {
    fontSize: 16,
  },

  value: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: "bold",
  },

  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 15,
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
  },

});
