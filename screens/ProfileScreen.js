import React, { useContext } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";

import { AppContext } from "../context/AppContext";
import { PET_IMAGES } from "../constants/PetImages";
import { COLORS, FONT } from "../constants/theme";

import {
  getTranslations,
} from "../services/TranslationService";

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

    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >

      <Text style={styles.title}>
        👤 {t.myProfile}
      </Text>

      <Image
        source={PET_IMAGES[selectedPet][petMood]}
        style={styles.pet}
      />

      <View style={styles.card}>

        <Text style={styles.item}>
          👤 {t.name}
        </Text>

        <Text style={styles.value}>
          {userName}
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.item}>
          🎂 {t.age}
        </Text>

        <Text style={styles.value}>
          {userAge}
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.item}>
          🌙 {t.sleepGoal}
        </Text>

        <Text style={styles.value}>
          {goalHours} {t.hours}
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.item}>
          ⭐ {t.level}
        </Text>

        <Text style={styles.value}>
          {level}
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.item}>
          ⭐ XP
        </Text>

        <Text style={styles.value}>
          {xp}/100
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.item}>
          💰 {t.coins}
        </Text>

        <Text style={styles.value}>
          {coins}
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.item}>
          🔥 {t.currentStreak}
        </Text>

        <Text style={styles.value}>
          {streak} {t.days}
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.item}>
          🌙 {t.totalSleepSessions}
        </Text>

        <Text style={styles.value}>
          {sleepHistory.length}
        </Text>

      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("EditProfile")}
      >

        <Text style={styles.buttonText}>
          {t.editProfile}
        </Text>

      </TouchableOpacity>

    </ScrollView>

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
    textAlign: "center",
    marginBottom: 20,
    color: COLORS.text,
  },

  pet: {
    width: 170,
    height: 170,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 18,
    marginBottom: 15,
    elevation: 4,
  },

  item: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },

  value: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
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