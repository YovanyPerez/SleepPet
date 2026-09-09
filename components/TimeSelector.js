import React, { useState, useRef, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import AppText from "./AppText";
import { COLORS, NIGHT, NIGHT_STYLES } from "../constants/theme";

function wrapValue(value, direction, min, max) {
  if (direction > 0) {
    return value >= max ? min : value + 1;
  }
  return value <= min ? max : value - 1;
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

        <TouchableOpacity
          style={styles.timeBtn}
          onPressIn={() => pressIn(-1)}
          onPressOut={clearHold}
        >
          <AppText style={styles.timeBtnText}>−</AppText>
        </TouchableOpacity>

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

        <TouchableOpacity
          style={styles.timeBtn}
          onPressIn={() => pressIn(1)}
          onPressOut={clearHold}
        >
          <AppText style={styles.timeBtnText}>+</AppText>
        </TouchableOpacity>

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
    color: COLORS.textSecondary,
  },

  timeLabelsSpacer: {
    width: 28,
  },

  timePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0EFFF",
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
    backgroundColor: "#DCD7FF",
  },

  timeValue: {
    minWidth: 40,
    textAlign: "center",
    fontSize: 28,
    fontFamily: "Nunito_800ExtraBold",
    color: COLORS.text,
  },

  timeColon: {
    fontSize: 24,
    fontFamily: "Nunito_700Bold",
    color: COLORS.textSecondary,
    marginHorizontal: 4,
  },

});
