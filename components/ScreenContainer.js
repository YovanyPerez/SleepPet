import React from "react";
import { View, StyleSheet } from "react-native";
import { COLORS } from "../constants/theme";

export default function ScreenContainer({ style, children, ...props }) {
  return (
    <View style={[styles.container, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
});
