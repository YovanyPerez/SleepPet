import React from "react";
import { View, StyleSheet } from "react-native";
import AppText from "./AppText";
import AppIcon from "./AppIcon";
import { COLORS, NIGHT } from "../constants/theme";

export default function SectionHeader({
  icon,
  title,
  iconColor = NIGHT.end,
  small = false,
}) {
  return (
    <View style={[styles.row, small && styles.rowSmall]}>
      <AppIcon
        name={icon}
        size={small ? 16 : 20}
        color={iconColor}
        style={styles.icon}
      />
      <AppText style={[styles.title, small && styles.titleSmall]}>
        {title}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    marginTop: 4,
  },

  icon: {
    marginRight: 10,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Nunito_800ExtraBold",
  },

  rowSmall: {
    marginBottom: 10,
  },

  titleSmall: {
    fontSize: 16,
  },
});
