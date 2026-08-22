import React, { useContext } from "react";
import { View, StyleSheet } from "react-native";

import { AppContext } from "../context/AppContext";
import {
  getTranslations,
} from "../services/TranslationService";
import { NIGHT } from "../constants/theme";

import AppText from "./AppText";
import AppIcon from "./AppIcon";

const MOOD_STYLES = {
  happy: { icon: "sparkles", color: "#5ED1C8", bg: "rgba(94,209,200,0.16)" },
  normal: { icon: "moon", color: "#8FA3FF", bg: "rgba(143,163,255,0.16)" },
  sleepy: { icon: "night", color: "#C9B8E8", bg: "rgba(201,184,232,0.16)" },
  sad: { icon: "cloud", color: "#F05A7A", bg: "rgba(240,90,122,0.16)" },
};

export default function SleepCard({ session }) {

  const { language } = useContext(AppContext);

  const t = getTranslations(language);

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

  const mood = MOOD_STYLES[session.mood] || MOOD_STYLES.normal;

  const moodName = moodText();

  return (

    <View style={styles.card}>

      {/* Parte superior */}

      <View style={styles.topRow}>

        <View style={[styles.moodCircle, { backgroundColor: mood.bg }]}>
          <AppIcon name={mood.icon} size={24} color={mood.color} />
        </View>

        <View style={styles.dateBlock}>

          <AppText style={styles.date}>
            {session.date}
          </AppText>

          {
            session.start && (
              <AppText style={styles.time}>
                {session.start}
              </AppText>
            )
          }

        </View>

        <View style={[styles.badge, { backgroundColor: mood.bg }]}>
          <AppText style={[styles.badgeText, { color: mood.color }]}>
            {moodName}
          </AppText>
        </View>

      </View>

      {session.preSleepBpm && (
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,143,171,0.16)", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, marginTop: 10, alignSelf: "flex-start" }}>
          <AppIcon name="heartPulse" size={14} color="#FF8FAB" />
          <AppText style={{ color: "#FF8FAB", fontSize: 12, fontFamily: "Nunito_700Bold", marginLeft: 6 }}>
            {session.preSleepBpm} {t.ppgBpmUnit}
          </AppText>
        </View>
      )}

      <View style={styles.divider} />

      {/* Métricas */}

      <View style={styles.metricsRow}>

        <View style={styles.metric}>

          <AppIcon name="night" size={18} color="#C9B8E8" />

          <AppText style={styles.metricLabel}>
            {t.sleep}
          </AppText>

          <AppText style={styles.metricValue}>
            {session.hours} {t.hours}
          </AppText>

        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metric}>

          <AppIcon name="coins" size={18} color={NIGHT.yellow} />

          <AppText style={styles.metricLabel}>
            {t.coins}
          </AppText>

          <AppText style={styles.metricValue}>
            +{session.coins}
          </AppText>

        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metric}>

          <AppIcon name="sparkles" size={18} color={mood.color} />

          <AppText style={styles.metricLabel}>
            {t.mood}
          </AppText>

          <AppText style={styles.metricValue}>
            {moodName}
          </AppText>

        </View>

      </View>

    </View>

  );

}

const styles = StyleSheet.create({

  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 26,
    padding: 18,
    marginBottom: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  moodCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  dateBlock: {
    flex: 1,
  },

  date: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "Nunito_800ExtraBold",
  },

  time: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontFamily: "Nunito_600SemiBold",
    marginTop: 2,
  },

  badge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  badgeText: {
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    marginVertical: 14,
  },

  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  metric: {
    flex: 1,
    alignItems: "center",
  },

  metricLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    fontFamily: "Nunito_600SemiBold",
    marginTop: 6,
  },

  metricValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Nunito_800ExtraBold",
    marginTop: 2,
  },

  metricDivider: {
    width: 1,
    height: 34,
    backgroundColor: "rgba(255,255,255,0.12)",
  },

});
