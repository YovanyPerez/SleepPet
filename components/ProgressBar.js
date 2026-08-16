import React from "react";
import { View, StyleSheet } from "react-native";
import { COLORS } from "../constants/theme";

export default function ProgressBar({
  progress = 0,
  color = COLORS.primary,
  background = "#E5E5E5",
  height = 8,
  radius = height / 2,
}) {
  const clamped = Math.max(0, Math.min(100, progress));

  return (
    <View
      style={[
        styles.track,
        {
          height,
          backgroundColor: background,
          borderRadius: radius,
        },
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${clamped}%`,
            height,
            backgroundColor: color,
            borderRadius: radius,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    overflow: "hidden",
  },
  fill: {
    overflow: "hidden",
  },
});
