import React, { useRef } from "react";
import { View, PanResponder } from "react-native";
import { TAB_ORDER } from "../constants/tabs";

const SWIPE_THRESHOLD = 60;

export default function SwipeableTabScreen({
  active,
  navigation,
  children,
}) {
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 20 &&
        Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
      onPanResponderRelease: (_, gesture) => {
        const index = TAB_ORDER.indexOf(active);
        if (index === -1) return;
        if (gesture.dx < -SWIPE_THRESHOLD && index < TAB_ORDER.length - 1) {
          navigation.navigate(TAB_ORDER[index + 1]);
        } else if (gesture.dx > SWIPE_THRESHOLD && index > 0) {
          navigation.navigate(TAB_ORDER[index - 1]);
        }
      },
    })
  ).current;

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      {children}
    </View>
  );
}
