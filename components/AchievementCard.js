import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { COLORS } from "../constants/theme";
import { AppContext } from "../context/AppContext";
import {
  getTranslations,
} from "../services/TranslationService";

export default function AchievementCard({

  achievement,

}) {

  const { language } = useContext(AppContext);

  const t = getTranslations(language);

  const percentage = Math.min(
    (achievement.progress / achievement.goal) * 100,
    100
  );

  return (

    <View
      style={[
        styles.card,
        achievement.unlocked && styles.unlockedCard,
      ]}
    >

      <Text style={styles.icon}>
        {achievement.icon}
      </Text>

      <Text style={styles.title}>
        {t[achievement.title]}
      </Text>

      <Text style={styles.description}>
        {t[achievement.description]}
      </Text>

      <View style={styles.progressBackground}>

        <View
          style={[
            styles.progressFill,
            {
              width: `${percentage}%`,
            },
          ]}
        />

      </View>

      <Text style={styles.progressText}>
        {achievement.progress} / {achievement.goal}
      </Text>

      <View style={styles.footer}>

        <Text style={styles.reward}>
          💰 {achievement.reward}
        </Text>

        <Text
          style={[
            styles.status,
            achievement.unlocked
              ? styles.completed
              : styles.locked,
          ]}
        >
          {achievement.unlocked
            ? `✅ ${t.completed}`
            : `🔒 ${t.locked}`}
        </Text>

      </View>

    </View>

  );

}

const styles = StyleSheet.create({

  card: {

    backgroundColor: "white",

    borderRadius: 20,

    padding: 20,

    marginBottom: 18,

    elevation: 4,

  },

  unlockedCard: {

    borderWidth: 2,

    borderColor: "#FFD54F",

  },

  icon: {

    fontSize: 48,

    textAlign: "center",

  },

  title: {

    marginTop: 10,

    fontSize: 22,

    fontWeight: "bold",

    textAlign: "center",

    color: COLORS.text,

  },

  description: {

    marginTop: 8,

    textAlign: "center",

    color: COLORS.textSecondary,

    fontSize: 15,

  },

  progressBackground: {

    height: 12,

    backgroundColor: "#E0E0E0",

    borderRadius: 10,

    marginTop: 20,

    overflow: "hidden",

  },

  progressFill: {

    height: 12,

    backgroundColor: COLORS.primary,

  },

  progressText: {

    textAlign: "center",

    marginTop: 10,

    fontWeight: "bold",

    color: COLORS.text,

  },

  footer: {

    marginTop: 18,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

  },

  reward: {

    fontSize: 17,

    fontWeight: "bold",

    color: COLORS.primary,

  },

  status: {

    fontSize: 15,

    fontWeight: "bold",

  },

  completed: {

    color: "#4CAF50",

  },

  locked: {

    color: "#999",

  },

});