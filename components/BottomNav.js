import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import AppIcon from "./AppIcon";
import { NIGHT } from "../constants/theme";
import { TAB_ORDER } from "../constants/tabs";

const TAB_ICONS = {
  Home: "home",
  Statistics: "statistics",
  Achievements: "achievements",
  PetShop: "store",
  Settings: "settings",
};

export default function BottomNav({ active, navigation, onTabLayout }) {
  return (
    <View
      style={styles.bar}
      onLayout={
        onTabLayout
          ? (e) => onTabLayout("__bar", e.nativeEvent.layout)
          : undefined
      }
    >
      {TAB_ORDER.map((key) => {
        const isActive = active === key;
        return (
          <TouchableOpacity
            key={key}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => navigation.navigate(key)}
            onLayout={
              onTabLayout
                ? (e) => onTabLayout(key, e.nativeEvent.layout)
                : undefined
            }
          >
            <AppIcon
              name={TAB_ICONS[key]}
              size={20}
              color="#FFFFFF"
            />
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
    paddingHorizontal: 6,
    paddingVertical: 10,
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
});
