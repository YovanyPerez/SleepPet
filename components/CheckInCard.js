import React, { useContext } from "react";
import { View, StyleSheet } from "react-native";

import { AppContext } from "../context/AppContext";
import { getTranslations } from "../services/TranslationService";
import { getCheckInByDate } from "../services/CheckInService";
import { toDateKey } from "../utils/dateUtils";
import { NIGHT, NIGHT_STYLES } from "../constants/theme";

import AppText from "./AppText";
import AppIcon from "./AppIcon";

export default function CheckInCard() {
  const { dailyCheckIns, language } = useContext(AppContext);

  const t = getTranslations(language);

  const dayKey = toDateKey(new Date());
  const existing = getCheckInByDate(dailyCheckIns, dayKey);

  const ENERGY_LABELS = {
    tired: t.checkinEnergyTired,
    low: t.checkinEnergyLow,
    okay: t.checkinEnergyOkay,
    good: t.checkinEnergyGood,
    energetic: t.checkinEnergyEnergetic,
  };

  const STUDY_LABELS = {
    difficult: t.checkinStudyDifficult,
    normal: t.checkinStudyNormal,
    good: t.checkinStudyGood,
    productive: t.checkinStudyProductive,
  };

  const missing = !existing?.energy || !existing?.studyExperience;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <AppIcon name="sparkles" size={20} color={NIGHT.yellow} />
        </View>
        <AppText style={styles.title}>{t.checkInTitle}</AppText>
      </View>

      {existing?.energy && (
        <View style={styles.summaryRow}>
          <AppText style={styles.summaryLabel}>{t.checkInEnergyLabel}</AppText>
          <AppText style={styles.summaryValue}>
            {ENERGY_LABELS[existing.energy]}
          </AppText>
        </View>
      )}

      {existing?.studyExperience && (
        <View style={styles.summaryRow}>
          <AppText style={styles.summaryLabel}>{t.checkInStudyLabel}</AppText>
          <AppText style={styles.summaryValue}>
            {STUDY_LABELS[existing.studyExperience]}
          </AppText>
        </View>
      )}

      {missing && (
        <AppText style={styles.hint}>{t.checkInAtSleepHint}</AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...NIGHT_STYLES.glassCard,
    marginBottom: 16,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Nunito_800ExtraBold",
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },

  summaryLabel: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
  },

  summaryValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Nunito_800ExtraBold",
  },

  hint: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    marginTop: 8,
  },
});
