import React from "react";
import { View, StyleSheet } from "react-native";
import { COLORS, BORDER_RADIUS, SHADOW } from "../constants/theme";

export default function Card({ style, children, ...props }) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.medium,
    padding: 20,
    marginBottom: 20,
    ...SHADOW.card,
  },
});
