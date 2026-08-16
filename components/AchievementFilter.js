import React from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import AppText from "./AppText";
import AppIcon from "./AppIcon";
import { NIGHT } from "../constants/theme";

export default function AchievementFilter({
  options,
  active,
  onChange,
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}
    >
      {options.map((option) => {
        const isActive = active === option.key;
        return (
          <TouchableOpacity
            key={option.key}
            style={[styles.pill, isActive && styles.pillActive]}
            onPress={() => onChange(option.key)}
          >
            <AppIcon
              name={option.icon}
              size={14}
              color={isActive ? "#FFFFFF" : "rgba(255,255,255,0.8)"}
              style={styles.pillIcon}
            />
            <AppText
              style={[
                styles.pillText,
                isActive && styles.pillTextActive,
              ]}
            >
              {option.label}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginTop: 18,
    marginHorizontal: -20,
  },

  row: {
    flexDirection: "row",
    paddingHorizontal: 20,
  },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },

  pillActive: {
    backgroundColor: NIGHT.end,
  },

  pillIcon: {
    marginRight: 5,
  },

  pillText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
  },

  pillTextActive: {
    color: "#FFFFFF",
  },
});
