// SleepCard

import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { AppContext } from "../context/AppContext";

import {
  getTranslations,
} from "../services/TranslationService";

import { COLORS } from "../constants/theme";

export default function SleepCard({ session }) {

  const { language } = useContext(AppContext);

  const t = getTranslations(language);

  const moodEmoji = {

    happy: "😊",

    normal: "😐",

    sleepy: "🥱",

    sad: "😢",

  };

  function moodText() {

    switch (session.mood) {

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

    <View style={styles.card}>

      <View style={styles.row}>

        <Text style={styles.emoji}>
          {moodEmoji[session.mood]}
        </Text>

        <Text style={styles.date}>
          {session.date}
        </Text>

      </View>

      <Text style={styles.info}>
        😴 {t.sleep}: {session.hours} {t.hours}
      </Text>

      <Text style={styles.info}>
        💰 {t.coins}: +{session.coins}
      </Text>

      <Text style={styles.info}>
        {t.mood}: {moodText()}
      </Text>

    </View>

  );

}

const styles = StyleSheet.create({

  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    elevation: 4,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  emoji: {
    fontSize: 28,
    marginRight: 10,
  },

  date: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },

  info: {
    marginTop: 4,
    fontSize: 16,
    color: COLORS.textSecondary,
  },

});