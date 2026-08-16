import React, { useContext } from "react";
import { View, StyleSheet } from "react-native";

import { COLORS, NIGHT } from "../constants/theme";
import { AppContext } from "../context/AppContext";
import {
  getTranslations,
} from "../services/TranslationService";

import AppText from "./AppText";
import AppIcon from "./AppIcon";
import ProgressBar from "./ProgressBar";

const TYPE_COLORS = {
  sessions: "#6B5BE7",
  streak: "#F97316",
  coins: "#F59E0B",
  level: NIGHT.yellow,
  pets: NIGHT.pink,
};

export default function AchievementCard({
  achievement,
}) {

  const { language } = useContext(AppContext);

  const t = getTranslations(language);

  const percentage = Math.min(
    (achievement.progress / achievement.goal) * 100,
    100
  );

  const unlocked = achievement.unlocked;

  const inProgress = !unlocked && achievement.progress > 0;

  const typeColor = TYPE_COLORS[achievement.type] || "#6B5BE7";

  const iconColor = unlocked ? typeColor : "#9AA0B8";

  const iconCircleBg = unlocked ? "#EDEAFF" : "#F0F0F5";

  const barColor = unlocked
    ? COLORS.success
    : inProgress
    ? NIGHT.end
    : "#D5D1EE";

  const statusIcon = unlocked ? "check" : "lock";

  const statusText = unlocked
    ? t.completed
    : inProgress
    ? t.inProgress
    : t.locked;

  const statusBg = unlocked
    ? "#DCF5E3"
    : inProgress
    ? "#EDEAFF"
    : "#EEEEEE";

  const statusColor = unlocked
    ? "#2E7D32"
    : inProgress
    ? "#5751C9"
    : "#9AA0B8";

  return (

    <View
      style={[
        styles.card,
        unlocked && styles.cardUnlocked,
      ]}
    >

      {/* Icono */}

      <View style={[styles.iconCircle, { backgroundColor: iconCircleBg }]}>

        {
          achievement.iconName ? (
            <AppIcon name={achievement.iconName} size={26} color={iconColor} />
          ) : (
            <AppText style={styles.iconText}>{achievement.icon}</AppText>
          )
        }

      </View>

      {/* Centro */}

      <View style={styles.middle}>

        <AppText style={styles.title} numberOfLines={1}>
          {t[achievement.title]}
        </AppText>

        <AppText style={styles.description} numberOfLines={2}>
          {t[achievement.description]}
        </AppText>

        <ProgressBar
          progress={percentage}
          color={barColor}
          background="#EAE7FF"
          height={8}
          radius={4}
        />

        <AppText style={styles.progressText}>
          {achievement.progress} / {achievement.goal}
        </AppText>

      </View>

      {/* Derecha */}

      <View style={styles.right}>

        <View style={styles.rewardCapsule}>

          <AppIcon name="coins" size={14} color="#F59E0B" style={styles.rewardIcon} />

          <AppText style={styles.reward}>
            {achievement.reward}
          </AppText>

        </View>

        <View style={[styles.statusPill, { backgroundColor: statusBg }]}>

          <AppIcon
            name={statusIcon}
            size={12}
            color={statusColor}
            style={styles.statusIcon}
          />

          <AppText style={[styles.status, { color: statusColor }]}>
            {statusText}
          </AppText>

        </View>

      </View>

    </View>

  );

}

const styles = StyleSheet.create({

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "transparent",
    padding: 14,
    marginBottom: 14,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  cardUnlocked: {
    borderColor: "#4CAF50",
  },

  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  iconText: {
    fontSize: 26,
  },

  middle: {
    flex: 1,
    marginRight: 8,
  },

  title: {
    fontSize: 17,
    fontFamily: "Nunito_800ExtraBold",
    color: COLORS.text,
  },

  description: {
    fontSize: 12,
    fontFamily: "Nunito_400Regular",
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  progressText: {
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
    color: COLORS.text,
    marginTop: 4,
  },

  right: {
    alignItems: "flex-end",
  },

  rewardCapsule: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEE7FB",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },

  rewardIcon: {
    marginRight: 4,
  },

  reward: {
    fontSize: 15,
    fontFamily: "Nunito_800ExtraBold",
    color: "#5751C9",
  },

  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  statusIcon: {
    marginRight: 4,
  },

  status: {
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
  },

});
