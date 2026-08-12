import React from "react";
import { Text, StyleSheet } from "react-native";
import { COLORS, TEXT } from "../constants/theme";

export default function AppText({
  variant = "body",
  color,
  center,
  style,
  children,
  ...props
}) {
  return (
    <Text
      style={[
        styles.base,
        TEXT[variant],
        center && styles.center,
        color && { color },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: COLORS.text,
  },
  center: {
    textAlign: "center",
  },
});
