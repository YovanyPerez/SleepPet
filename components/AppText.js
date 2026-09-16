import React from "react";
import { Text, StyleSheet } from "react-native";
import { COLORS } from "../constants/theme";

export default function AppText({ color, style, children, ...props }) {
  return (
    <Text style={[styles.base, color && { color }, style]} {...props}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: COLORS.text,
  },
});
