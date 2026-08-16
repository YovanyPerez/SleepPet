import React from "react";
import { View, StyleSheet } from "react-native";
import AppText from "./AppText";
import AppIcon from "./AppIcon";
import { NIGHT } from "../constants/theme";

export default function AchievementSummary({ achievements, t }) {

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const totalRewards = achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + (a.reward || 0), 0);

  return (
    <View style={styles.card}>

      <View style={styles.block}>

        <View style={styles.iconCircle}>
          <AppIcon name="level" size={20} color={NIGHT.yellow} />
        </View>

        <View style={styles.blockText}>
          <AppText style={styles.number}>{unlockedCount}</AppText>
          <AppText style={styles.label}>
            {t.achievementsUnlockedLabel}
          </AppText>
        </View>

      </View>

      <View style={styles.divider} />

      <View style={styles.block}>

        <View style={styles.iconCircle}>
          <AppIcon name="coins" size={20} color="#F59E0B" />
        </View>

        <View style={styles.blockText}>
          <AppText style={styles.number}>{totalRewards}</AppText>
          <AppText style={styles.label}>
            {t.totalRewardsLabel}
          </AppText>
        </View>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 22,
    padding: 16,
    marginTop: 6,
  },

  block: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  blockText: {
    marginLeft: 10,
    flexShrink: 1,
  },

  number: {
    color: "#FFFFFF",
    fontSize: 24,
    fontFamily: "Nunito_800ExtraBold",
  },

  label: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontFamily: "Nunito_600SemiBold",
  },

  divider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 6,
  },
});
