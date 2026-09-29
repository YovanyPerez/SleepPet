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
  variant = "white",
}) {
  const glass = variant === "glass";
  return (
    <View style={[styles.card, glass && styles.cardGlass]}>

      <View style={[styles.iconCircle, glass && styles.iconCircleGlass]}>
        <AppIcon name={icon} size={22} color={iconColor} />
      </View>

      <View style={styles.text}>

        <AppText style={[styles.label, glass && styles.labelGlass]}>
          {label}
        </AppText>

        <AppText
          style={[styles.value, glass && styles.valueGlass]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {value}
        </AppText>

        <AppText style={[styles.sub, glass && styles.subGlass]}>
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

  cardGlass: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    elevation: 0,
    shadowOpacity: 0,
  },

  iconCircleGlass: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  labelGlass: {
    color: "rgba(255,255,255,0.65)",
  },

  valueGlass: {
    color: "#FFFFFF",
  },

  subGlass: {
    color: "rgba(255,255,255,0.55)",
  },
});
