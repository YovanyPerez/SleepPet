import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { COLORS } from "../constants/theme";

function parseTimeString(str) {

  const match = String(str).match(
    /(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)?/i
  );

  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]) || 0;
  const seconds = Number(match[3]) || 0;
  const suffix = match[4] ? match[4].toLowerCase() : null;

  if (suffix === "pm" && hours < 12) hours += 12;
  if (suffix === "am" && hours === 12) hours = 0;

  return hours * 3600 + minutes * 60 + seconds;

}

function daySecondsOf(entry, startSec, crossedMidnight) {

  let seconds = null;

  if (typeof entry === "number") {

    const d = new Date(entry);

    seconds =
      d.getHours() * 3600 +
      d.getMinutes() * 60 +
      d.getSeconds();

  } else if (typeof entry === "string") {

    seconds = parseTimeString(entry);

  }

  if (seconds === null) return null;

  if (crossedMidnight && seconds < startSec) {
    seconds += 86400;
  }

  return seconds;

}

function formatHM(ms) {

  const d = new Date(ms);

  const h = d.getHours();

  const m = String(d.getMinutes()).padStart(2, "0");

  return `${h}:${m}`;

}

export default function NightChart({
  startMs,
  endMs,
  unlockTimes,
  countLabel,
  emptyLabel,
}) {

  const start = new Date(startMs);

  const end = new Date(endMs);

  let startSec =
    start.getHours() * 3600 +
    start.getMinutes() * 60 +
    start.getSeconds();

  let endSec =
    end.getHours() * 3600 +
    end.getMinutes() * 60 +
    end.getSeconds();

  const crossedMidnight = endSec <= startSec;

  if (crossedMidnight) endSec += 86400;

  const duration = endSec - startSec;

  const positions = (unlockTimes || [])
    .map((entry) =>
      daySecondsOf(entry, startSec, crossedMidnight)
    )
    .filter((value) => value !== null)
    .map((seconds) => {
      if (duration <= 0) return 0;
      return Math.min(
        Math.max((seconds - startSec) / duration, 0),
        1
      );
    });

  return (
    <View style={styles.container}>

      <View style={styles.track}>

        <View style={styles.line} />

        {positions.map((position, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                left: `${position * 100}%`,
              },
            ]}
          />
        ))}

      </View>

      <View style={styles.labelsRow}>

        <Text style={styles.timeLabel}>
          {formatHM(startMs)}
        </Text>

        <Text style={styles.countLabel}>
          {positions.length > 0
            ? countLabel
            : emptyLabel}
        </Text>

        <Text style={styles.timeLabel}>
          {formatHM(endMs)}
        </Text>

      </View>

    </View>
  );

}

const styles = StyleSheet.create({

  container: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 18,
    elevation: 4,
    marginBottom: 20,
  },

  track: {
    height: 24,
    justifyContent: "center",
  },

  line: {
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 6,
  },

  dot: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.danger,
    marginLeft: -6,
    borderWidth: 2,
    borderColor: "white",
  },

  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  timeLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "bold",
  },

  countLabel: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: "bold",
  },

});
