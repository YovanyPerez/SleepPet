import React, { useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import ReanimatedAnimated from "react-native-reanimated";
import AppIcon from "./AppIcon";
import { NIGHT } from "../constants/theme";
import { TAB_ORDER } from "../constants/tabs";

// Frames de la barra (wrapper + bar + tabs) que Home consume para el
// onboarding. Los publica TabsNavigator, que es quien renderiza la barra.
export const TabBarFramesContext = React.createContext({});

const TAB_ICONS = {
  Home: "home",
  Statistics: "statistics",
  Achievements: "achievements",
  PetShop: "store",
  Settings: "settings",
};

const BAR_PADDING_H = 6;

export default function BottomNav({ active, navigation, onTabLayout, position }) {
  const [barWidth, setBarWidth] = useState(0);

  const tabWidth =
    barWidth > 0 ? (barWidth - BAR_PADDING_H * 2) / TAB_ORDER.length : 0;
  const activeIndex = Math.max(0, TAB_ORDER.indexOf(active));

  // position (0–4, fraccionario durante el swipe) la entrega material-top-tabs;
  // el pill acompaña el dedo. Sin position (fallback) queda fijo en el activo.
  const pillX = position
    ? Animated.multiply(position, tabWidth)
    : tabWidth * activeIndex;

  return (
    <View
      style={styles.bar}
      onLayout={(e) => {
        setBarWidth(e.nativeEvent.layout.width);
        if (onTabLayout) onTabLayout("__bar", e.nativeEvent.layout);
      }}
    >
      {tabWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pill,
            { width: tabWidth, transform: [{ translateX: pillX }] },
          ]}
        />
      )}

      {TAB_ORDER.map((key) => (
        <Pressable
          key={key}
          style={styles.tab}
          onPress={() => navigation.navigate(key)}
          onLayout={
            onTabLayout
              ? (e) => onTabLayout(key, e.nativeEvent.layout)
              : undefined
          }
        >
          {({ pressed }) => (
            <ReanimatedAnimated.View
              style={[styles.tabInner, pressed && styles.tabPressed]}
            >
              <AppIcon name={TAB_ICONS[key]} size={20} color="#FFFFFF" />
            </ReanimatedAnimated.View>
          )}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: NIGHT.start,
    borderRadius: 28,
    paddingHorizontal: BAR_PADDING_H,
    paddingVertical: 10,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },

  pill: {
    position: "absolute",
    left: BAR_PADDING_H,
    top: 10,
    bottom: 10,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.14)",
  },

  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },

  tabInner: {
    alignItems: "center",
    justifyContent: "center",
    transitionProperty: "transform",
    transitionDuration: 120,
    transitionTimingFunction: "ease-out",
  },

  tabPressed: {
    transform: [{ scale: 0.97 }],
  },
});
