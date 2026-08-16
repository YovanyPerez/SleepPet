import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import AppText from "./AppText";
import { NIGHT } from "../constants/theme";

const TABS = [
  { key: "Home", icon: "🏠", labelKey: "home" },
  { key: "Statistics", icon: "📊", labelKey: "statistics" },
  { key: "Achievements", icon: "🏆", labelKey: "achievements" },
  { key: "Settings", icon: "⚙️", labelKey: "settings" },
];

export default function BottomNav({ active, t, navigation }) {
  return (
    <View style={styles.bar}>
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => navigation.navigate(tab.key)}
          >
            <AppText style={styles.icon}>{tab.icon}</AppText>
            <AppText style={styles.label}>
              {t[tab.labelKey]}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: NIGHT.start,
    borderRadius: 28,
    paddingHorizontal: 8,
    paddingVertical: 8,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },

  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 20,
  },

  tabActive: {
    backgroundColor: "rgba(255,255,255,0.14)",
  },

  icon: {
    fontSize: 20,
    marginBottom: 2,
  },

  label: {
    color: NIGHT.textOnNight,
    fontSize: 11,
    fontFamily: "Nunito_700Bold",
  },
});
