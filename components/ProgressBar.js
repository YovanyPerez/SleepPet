import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { COLORS } from "../constants/theme";

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

export default function ProgressBar({
  progress = 0,
  color = COLORS.primary,
  background = "#E5E5E5",
  height = 8,
  radius = height / 2,
}) {
  const clamped = Math.max(0, Math.min(100, progress));
  const reduced = useReducedMotion();
  const value = useSharedValue(clamped);
  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    value.set(
      reduced
        ? clamped
        : withTiming(clamped, { duration: 250, easing: EASE_OUT })
    );
  }, [clamped, reduced, value]);

  // width en px sobre un fill absoluto y sin hijos (fuera de flujo): conserva
  // el borderRadius y no re-layouta hermanos.
  const fill = useAnimatedStyle(
    () => ({ width: (trackWidth * value.get()) / 100 }),
    [trackWidth]
  );

  return (
    <View
      style={[
        styles.track,
        { height, backgroundColor: background, borderRadius: radius },
      ]}
      onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
    >
      <Animated.View
        style={[
          styles.fill,
          { backgroundColor: color, borderRadius: radius },
          fill,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    overflow: "hidden",
  },
  fill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
  },
});
