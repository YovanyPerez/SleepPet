import React, { useContext, useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";

import { AppContext } from "../context/AppContext";
import { getTranslations } from "../services/TranslationService";
import {
  upsertCheckIn,
  getCheckInByDate,
  ENERGY_LEVELS,
  STUDY_LEVELS,
} from "../services/CheckInService";
import { toDateKey } from "../utils/dateUtils";
import { NIGHT, NIGHT_STYLES } from "../constants/theme";

import AppText from "./AppText";
import AppIcon from "./AppIcon";

export default function CheckInCard() {
  const { dailyCheckIns, setDailyCheckIns, language } =
    useContext(AppContext);

  const t = getTranslations(language);

  const dayKey = toDateKey(new Date());
  const existing = getCheckInByDate(dailyCheckIns, dayKey);

  const [editing, setEditing] = useState(false);
  const [energy, setEnergy] = useState(null);
  const [study, setStudy] = useState(null);

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

  function startEdit() {
    setEnergy(existing?.energy ?? null);
    setStudy(existing?.studyExperience ?? null);
    setEditing(true);
  }

  function save() {
    if (!energy || !study) return;
    setDailyCheckIns(
      upsertCheckIn(dailyCheckIns, {
        dateKey: dayKey,
        energy,
        studyExperience: study,
        updatedAt: Date.now(),
      })
    );
    setEditing(false);
  }

  function renderPills(levels, labels, selected, onSelect) {
    return (
      <View style={styles.pillWrap}>
        {levels.map((level) => {
          const active = selected === level;
          return (
            <TouchableOpacity
              key={level}
              style={[styles.pill, active && styles.pillActive]}
              onPress={() => onSelect(level)}
            >
              <AppText
                style={[styles.pillText, active && styles.pillTextActive]}
              >
                {labels[level]}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  const showSummary = existing && !editing;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <AppIcon name="sparkles" size={20} color={NIGHT.yellow} />
        </View>
        <AppText style={styles.title}>{t.checkInTitle}</AppText>
      </View>

      {showSummary && (
        <>
          <View style={styles.summaryRow}>
            <AppText style={styles.summaryLabel}>
              {t.checkInEnergyLabel}
            </AppText>
            <AppText style={styles.summaryValue}>
              {ENERGY_LABELS[existing.energy]}
            </AppText>
          </View>
          <View style={styles.summaryRow}>
            <AppText style={styles.summaryLabel}>
              {t.checkInStudyLabel}
            </AppText>
            <AppText style={styles.summaryValue}>
              {STUDY_LABELS[existing.studyExperience]}
            </AppText>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={startEdit}>
            <AppText style={styles.editButtonText}>{t.checkInEdit}</AppText>
          </TouchableOpacity>
        </>
      )}

      {!editing && !existing && (
        <>
          <AppText style={styles.prompt}>{t.checkInPrompt}</AppText>
          <TouchableOpacity style={styles.primaryButton} onPress={startEdit}>
            <AppIcon name="check" size={18} color="#FFFFFF" />
            <AppText style={styles.primaryButtonText}>
              {t.checkInCheckIn}
            </AppText>
          </TouchableOpacity>
        </>
      )}

      {editing && (
        <>
          <AppText style={styles.question}>{t.checkInEnergyQuestion}</AppText>
          {renderPills(ENERGY_LEVELS, ENERGY_LABELS, energy, setEnergy)}

          <AppText style={styles.question}>{t.checkInStudyQuestion}</AppText>
          {renderPills(STUDY_LEVELS, STUDY_LABELS, study, setStudy)}

          <TouchableOpacity
            style={[styles.primaryButton, (!energy || !study) && styles.disabled]}
            disabled={!energy || !study}
            onPress={save}
          >
            <AppIcon name="save" size={18} color="#FFFFFF" />
            <AppText style={styles.primaryButtonText}>{t.checkInSave}</AppText>
          </TouchableOpacity>
        </>
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

  prompt: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    marginBottom: 12,
  },

  question: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    marginTop: 6,
    marginBottom: 8,
  },

  pillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 6,
  },

  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
  },

  pillActive: {
    backgroundColor: NIGHT.end,
    borderColor: NIGHT.end,
  },

  pillText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Nunito_600SemiBold",
  },

  pillTextActive: {
    color: "#FFFFFF",
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

  editButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  editButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
  },

  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: NIGHT.end,
    borderRadius: 16,
    paddingVertical: 13,
    marginTop: 8,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Nunito_800ExtraBold",
  },

  disabled: {
    opacity: 0.5,
  },
});
