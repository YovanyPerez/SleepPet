import React, { useState, useRef, useEffect } from "react";
import { View, Pressable, TouchableOpacity, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import AppText from "./AppText";
import { NIGHT, NIGHT_STYLES } from "../constants/theme";

function wrapValue(value, direction, min, max) {
  const size = max - min + 1;
  return min + (((value - min + direction) % size) + size) % size;
}

// Selector de hora [−] HH : MM [+] con press-and-hold (extraído de SettingsScreen,
// mismo diseño y comportamiento; onStep(field, direction) con wrap a cargo del padre)
export default function TimeSelector({ hour, minute, hourLabel, minuteLabel, onStep }) {

  const [field, setField] = useState("hour");

  const fieldRef = useRef(field);
  fieldRef.current = field;

  const timer = useRef(null);

  useEffect(() => () => clearHold(), []);

  function clearHold() {
    if (timer.current) {
      clearTimeout(timer.current.timeout);
      clearInterval(timer.current.interval);
      timer.current = null;
    }
  }

  function step(direction) {
    onStep(fieldRef.current, direction);
  }

  function pressIn(direction) {
    step(direction);
    const timeout = setTimeout(() => {
      timer.current.interval = setInterval(() => step(direction), 110);
    }, 350);
    timer.current = { timeout, interval: null };
  }

  const hourActive = field === "hour";
  const minuteActive = field === "minute";

  return (
    <View style={styles.timeContainer}>

      <View style={styles.timeLabels}>
        <AppText style={styles.timeFieldLabel}>{hourLabel}</AppText>
        <View style={styles.timeLabelsSpacer} />
        <AppText style={styles.timeFieldLabel}>{minuteLabel}</AppText>
      </View>

      <View style={styles.timePill}>

        <Pressable onPressIn={() => pressIn(-1)} onPressOut={clearHold}>
          {({ pressed }) => (
            <Animated.View
              style={[styles.timeBtn, pressed && styles.timeBtnPressed]}
            >
              <AppText style={styles.timeBtnText}>−</AppText>
            </Animated.View>
          )}
        </Pressable>

        <View style={styles.timeValues}>

          <TouchableOpacity
            style={[styles.timeField, hourActive && styles.timeFieldActive]}
            onPress={() => setField("hour")}
          >
            <AppText style={styles.timeValue}>
              {String(hour).padStart(2, "0")}
            </AppText>
          </TouchableOpacity>

          <AppText style={styles.timeColon}>:</AppText>

          <TouchableOpacity
            style={[styles.timeField, minuteActive && styles.timeFieldActive]}
            onPress={() => setField("minute")}
          >
            <AppText style={styles.timeValue}>
              {String(minute).padStart(2, "0")}
            </AppText>
          </TouchableOpacity>

        </View>

        <Pressable onPressIn={() => pressIn(1)} onPressOut={clearHold}>
          {({ pressed }) => (
            <Animated.View
              style={[styles.timeBtn, pressed && styles.timeBtnPressed]}
            >
              <AppText style={styles.timeBtnText}>+</AppText>
            </Animated.View>
          )}
        </Pressable>

      </View>

    </View>
  );
}

export { wrapValue };

const styles = StyleSheet.create({

  timeContainer: {
    marginTop: 18,
  },

  timeLabels: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  timeFieldLabel: {
    width: 62,
    textAlign: "center",
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
    color: "rgba(255,255,255,0.65)",
  },

  timeLabelsSpacer: {
    width: 28,
  },

  timePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  timeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: NIGHT.end,
    ...NIGHT_STYLES.center,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    transitionProperty: "transform",
    transitionDuration: 120,
    transitionTimingFunction: "ease-out",
  },

  timeBtnPressed: {
    transform: [{ scale: 0.94 }],
  },

  timeBtnText: {
    color: "white",
    fontSize: 22,
    fontFamily: "Nunito_700Bold",
  },

  timeValues: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  timeField: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },

  timeFieldActive: {
    backgroundColor: "rgba(255,255,255,0.22)",
  },

  timeValue: {
    minWidth: 40,
    textAlign: "center",
    fontSize: 28,
    fontFamily: "Nunito_800ExtraBold",
    color: "#FFFFFF",
  },

  timeColon: {
    fontSize: 24,
    fontFamily: "Nunito_700Bold",
    color: "rgba(255,255,255,0.6)",
    marginHorizontal: 4,
  },

});
