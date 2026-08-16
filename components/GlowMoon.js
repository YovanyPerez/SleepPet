import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NIGHT } from "../constants/theme";

export default function GlowMoon({ size = 120, color = NIGHT.yellow }) {
  const float = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const floatAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 3600,
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 3600,
          useNativeDriver: true,
        }),
      ])
    );
    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2600,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2600,
          useNativeDriver: true,
        }),
      ])
    );
    floatAnim.start();
    pulseAnim.start();
    return () => {
      floatAnim.stop();
      pulseAnim.stop();
    };
  }, [float, pulse]);

  const translateY = float.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  const haloOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.65],
  });

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          width: size * 1.7,
          height: size * 1.5,
          transform: [{ translateY }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.halo,
          {
            width: size * 1.1,
            height: size * 1.1,
            borderRadius: size * 0.55,
            backgroundColor: color,
            opacity: haloOpacity,
          },
        ]}
      />
      <MaterialCommunityIcons
        name="weather-night"
        size={size}
        color={color}
        style={[
          styles.icon,
          {
            textShadowColor: color,
            textShadowRadius: size * 0.18,
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  halo: {
    position: "absolute",
  },
  icon: {
    textShadowOffset: { width: 0, height: 0 },
  },
});
