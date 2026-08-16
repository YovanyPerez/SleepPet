import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { NIGHT } from "../constants/theme";

export default function NightBackground({ children }) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[NIGHT.start, NIGHT.end]}
        style={StyleSheet.absoluteFill}
      />

      <Text style={[styles.star, styles.s1]}>✦</Text>
      <Text style={[styles.star, styles.s2]}>★</Text>
      <Text style={[styles.star, styles.s3]}>✦</Text>
      <Text style={[styles.star, styles.s4]}>✧</Text>
      <Text style={[styles.star, styles.s5]}>✦</Text>
      <Text style={[styles.star, styles.s6]}>★</Text>
      <Text style={[styles.star, styles.s7]}>✦</Text>

      <Text style={styles.moon}>🌙</Text>

      <View style={[styles.cloud, styles.c1]} />
      <View style={[styles.cloud, styles.c2]} />
      <View style={[styles.cloud, styles.c3]} />

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  star: {
    position: "absolute",
    color: "rgba(255,255,255,0.75)",
  },

  s1: { top: 60, left: 40, fontSize: 14 },
  s2: { top: 110, left: 300, fontSize: 11 },
  s3: { top: 90, right: 60, fontSize: 16 },
  s4: { top: 180, left: 20, fontSize: 10 },
  s5: { top: 230, right: 30, fontSize: 13 },
  s6: { top: 40, left: 180, fontSize: 9 },
  s7: { top: 150, right: 130, fontSize: 12 },

  moon: {
    position: "absolute",
    top: 45,
    right: 25,
    fontSize: 44,
  },

  cloud: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 100,
  },

  c1: { top: 120, left: -30, width: 180, height: 60 },
  c2: { top: 200, right: -40, width: 220, height: 70 },
  c3: { top: 320, left: -20, width: 160, height: 50 },
});
