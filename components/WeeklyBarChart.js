import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { COLORS } from "../constants/theme";

const CHART_HEIGHT = 150;

const TOP_SPACE = 24;

export default function WeeklyBarChart({
  data,
  goalHours,
  goalLabel,
}) {

  const maxValue = Math.max(
    goalHours,
    ...data.map((item) => item.value),
    1
  );

  const goalY =
    (goalHours / maxValue) * CHART_HEIGHT;

  return (

    <View style={styles.container}>

      <View style={styles.chartArea}>

        <View
          style={[
            styles.goalLine,
            { bottom: goalY },
          ]}
        >

          <Text style={styles.goalText}>
            {goalLabel}
          </Text>

        </View>

        {data.map((item) => {

          const height =
            item.value > 0
              ? (item.value / maxValue) * CHART_HEIGHT
              : 0;

          return (

            <View
              key={item.key}
              style={styles.column}
            >

              <Text style={styles.barValue}>
                {item.value > 0
                  ? `${Math.round(item.value * 10) / 10}h`
                  : ""}
              </Text>

              <View
                style={[
                  styles.bar,
                  { height: Math.max(height, 3) },
                  item.isToday
                    ? styles.barToday
                    : item.value > 0
                    ? styles.barNormal
                    : styles.barEmpty,
                ]}
              />

            </View>

          );

        })}

      </View>

      <View style={styles.labelsRow}>

        {data.map((item) => (

          <Text
            key={item.key}
            style={[
              styles.dayLabel,
              item.isToday && styles.dayLabelToday,
            ]}
          >

            {item.label}

          </Text>

        ))}

      </View>

    </View>

  );

}

const styles = StyleSheet.create({

  container: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 18,
    paddingTop: 26,
    elevation: 4,
    marginBottom: 20,
  },

  chartArea: {
    height: CHART_HEIGHT + TOP_SPACE,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  goalLine: {
    position: "absolute",
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: COLORS.warning,
    borderStyle: "dashed",
    zIndex: 1,
  },

  goalText: {
    position: "absolute",
    top: -16,
    right: 0,
    fontSize: 11,
    color: COLORS.warning,
    fontWeight: "bold",
  },

  column: {
    flex: 1,
    height: CHART_HEIGHT + TOP_SPACE,
    justifyContent: "flex-end",
    alignItems: "center",
    marginHorizontal: 4,
  },

  barValue: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 3,
    fontWeight: "bold",
  },

  bar: {
    width: 22,
    borderRadius: 6,
  },

  barNormal: {
    backgroundColor: COLORS.primary,
  },

  barToday: {
    backgroundColor: COLORS.secondary,
  },

  barEmpty: {
    backgroundColor: "#E3E6EE",
  },

  labelsRow: {
    flexDirection: "row",
    marginTop: 8,
  },

  dayLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  dayLabelToday: {
    color: COLORS.primary,
    fontWeight: "bold",
  },

});
