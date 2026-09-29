import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";

import { NIGHT } from "../constants/theme";
import { ENERGY_LEVELS, STUDY_LEVELS } from "../services/CheckInService";
import AppIcon from "./AppIcon";
import AppText from "./AppText";

const ENERGY_KEYS = {
  tired: "checkinEnergyTired",
  low: "checkinEnergyLow",
  okay: "checkinEnergyOkay",
  good: "checkinEnergyGood",
  energetic: "checkinEnergyEnergetic",
};

const STUDY_KEYS = {
  difficult: "checkinStudyDifficult",
  normal: "checkinStudyNormal",
  good: "checkinStudyGood",
  productive: "checkinStudyProductive",
};

export default function PreSleepCheckInModal({
  visible,
  t,
  initialEnergy,
  initialStudy,
  onSave,
  onSkip,
}) {
  const [energy, setEnergy] = useState(initialEnergy ?? null);
  const [study, setStudy] = useState(initialStudy ?? null);

  useEffect(() => {
    if (visible) {
      setEnergy(initialEnergy ?? null);
      setStudy(initialStudy ?? null);
    }
  }, [visible, initialEnergy, initialStudy]);

  function renderPills(levels, keys, selected, onSelect) {
    return (
      <View style={styles.pillWrap}>
        {levels.map((level) => {
          const active = selected === level;
          return (
            <Pressable key={level} onPress={() => onSelect(level)}>
              {({ pressed }) => (
                <Animated.View
                  style={[
                    styles.pill,
                    active && styles.pillActive,
                    pressed && styles.pillPressed,
                  ]}
                >
                  <AppText style={styles.pillText}>{t[keys[level]]}</AppText>
                </Animated.View>
              )}
            </Pressable>
          );
        })}
      </View>
    );
  }

  const canSave = !!energy && !!study;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onSkip}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <AppIcon name="sparkles" size={22} color={NIGHT.yellow} />
          </View>
          <AppText style={styles.title}>{t.checkInBeforeSleepTitle}</AppText>

          <AppText style={styles.question}>{t.checkInEnergyQuestion}</AppText>
          {renderPills(ENERGY_LEVELS, ENERGY_KEYS, energy, setEnergy)}

          <AppText style={styles.question}>{t.checkInStudyQuestion}</AppText>
          {renderPills(STUDY_LEVELS, STUDY_KEYS, study, setStudy)}

          <Pressable
            accessibilityRole="button"
            disabled={!canSave}
            onPress={() => onSave(energy, study)}
            style={({ pressed }) => [
              styles.save,
              !canSave && styles.saveDisabled,
              pressed && canSave && styles.savePressed,
            ]}
          >
            <AppIcon name="save" size={18} color="#FFFFFF" />
            <AppText style={styles.saveText}>{t.checkInSave}</AppText>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={onSkip}
            style={({ pressed }) => [styles.skip, pressed && styles.skipPressed]}
          >
            <AppText style={styles.skipText}>{t.checkInSkip}</AppText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "rgba(8, 9, 36, 0.78)",
  },
  card: {
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    padding: 22,
    borderRadius: 24,
    backgroundColor: "#29295C",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    marginBottom: 14,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    lineHeight: 25,
    textAlign: "center",
    fontFamily: "Nunito_800ExtraBold",
  },
  question: {
    alignSelf: "flex-start",
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    marginTop: 16,
    marginBottom: 8,
  },
  pillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
    transitionProperty: ["transform", "backgroundColor", "borderColor"],
    transitionDuration: 150,
    transitionTimingFunction: "ease-out",
  },
  pillActive: {
    backgroundColor: NIGHT.end,
    borderColor: NIGHT.end,
  },
  pillPressed: {
    transform: [{ scale: 0.97 }],
  },
  pillText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Nunito_600SemiBold",
  },
  save: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    backgroundColor: NIGHT.end,
    borderRadius: 16,
    paddingVertical: 13,
    marginTop: 22,
  },
  saveDisabled: {
    opacity: 0.5,
  },
  savePressed: {
    opacity: 0.85,
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Nunito_800ExtraBold",
  },
  skip: {
    minHeight: 42,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
    marginTop: 10,
  },
  skipPressed: {
    opacity: 0.7,
  },
  skipText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
  },
});
