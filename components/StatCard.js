import React from "react";
import { View, StyleSheet } from "react-native";
import AppText from "./AppText";
import AppIcon from "./AppIcon";
import { COLORS, SHADOW } from "../constants/theme";

export default function StatCard({
  icon,
  iconColor,
  label,
  value,
  sub,
}) {
  return (
    <View style={styles.card}>

      <View style={styles.iconCircle}>
        <AppIcon name={icon} size={22} color={iconColor} />
      </View>

      <View style={styles.text}>

        <AppText style={styles.label}>
          {label}
        </AppText>

        <AppText
          style={styles.value}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {value}
        </AppText>

        <AppText style={styles.sub}>
          {sub}
        </AppText>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 14,
    marginBottom: 14,
    ...SHADOW.card,
  },

  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EDEBFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  text: {
    flex: 1,
  },

  label: {
    fontSize: 12,
    fontFamily: "Nunito_600SemiBold",
    color: COLORS.textSecondary,
  },

  value: {
    fontSize: 20,
    fontFamily: "Nunito_800ExtraBold",
    color: COLORS.text,
    marginTop: 1,
  },

  sub: {
    fontSize: 11,
    fontFamily: "Nunito_400Regular",
    color: COLORS.textSecondary,
  },
});
