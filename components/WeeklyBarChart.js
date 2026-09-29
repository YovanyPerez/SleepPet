import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { COLORS, NIGHT, SHADOW } from "../constants/theme";

const CHART_HEIGHT = 150;

const TOP_SPACE = 24;

export default function WeeklyBarChart({
  data,
  goalHours,
  goalLabel,
  variant = "white",
  headline = null,
  headlineSub = null,
}) {

  const glass = variant === "glass";

  const maxValue = Math.max(
    goalHours,
    ...data.map((item) => item.value),
    1
  );

  const goalY =
    (goalHours / maxValue) * CHART_HEIGHT;

  return (

    <View style={[styles.container, glass && styles.containerGlass]}>

      {(headline != null || headlineSub != null) && (
        <View style={styles.headlineRow}>
          {headline != null && (
            <Text style={[styles.headline, glass && styles.headlineGlass]}>
              {headline}
            </Text>
          )}
          {headlineSub != null && (
            <Text style={[styles.headlineSub, glass && styles.headlineSubGlass]}>
              {headlineSub}
            </Text>
          )}
        </View>
      )}

      <View style={styles.chartArea}>

        <View
          style={[
            styles.goalLine,
            { bottom: goalY },
          ]}
        >

          <Text style={styles.goalText}>
            {goalLabel} {goalHours}h
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
              style={[
                styles.column,
                item.isToday && styles.columnToday,
              ]}
            >

              <Text style={[styles.barValue, glass && styles.barValueGlass]}>
                {item.value > 0
                  ? `${Math.round(item.value * 10) / 10}h`
                  : ""}
              </Text>

              {
                item.value > 0 ? (
                  <LinearGradient
                    colors={
                      item.isToday
                        ? [NIGHT.end, "#4A3F8F"]
                        : [NIGHT.end, "#7C6FD0"]
                    }
                    style={[
                      styles.bar,
                      { height: Math.max(height, 3) },
                    ]}
                  />
                ) : (
                  <View
                    style={[
                      styles.bar,
                      styles.barEmpty,
                      { height: Math.max(height, 3) },
                    ]}
                  />
                )
              }

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
              glass && styles.dayLabelGlass,
              glass && item.isToday && styles.dayLabelTodayGlass,
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
    borderRadius: 26,
    padding: 16,
    paddingTop: 26,
    marginBottom: 22,
    ...SHADOW.card,
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
    fontFamily: "Nunito_700Bold",
  },

  column: {
    flex: 1,
    height: CHART_HEIGHT + TOP_SPACE,
    justifyContent: "flex-end",
    alignItems: "center",
    marginHorizontal: 3,
    borderRadius: 14,
  },

  columnToday: {
    backgroundColor: "rgba(107,91,231,0.12)",
  },

  barValue: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 3,
    fontFamily: "Nunito_700Bold",
  },

  bar: {
    width: 22,
    borderRadius: 6,
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
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: "Nunito_600SemiBold",
  },

  dayLabelToday: {
    color: NIGHT.end,
    fontWeight: "bold",
    fontFamily: "Nunito_800ExtraBold",
  },

  containerGlass: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    elevation: 0,
    shadowOpacity: 0,
  },

  headlineRow: {
    marginBottom: 6,
  },

  headline: {
    fontSize: 26,
    fontFamily: "Nunito_800ExtraBold",
    color: COLORS.text,
  },

  headlineGlass: {
    color: "#FFFFFF",
  },

  headlineSub: {
    fontSize: 13,
    fontFamily: "Nunito_600SemiBold",
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  headlineSubGlass: {
    color: "rgba(255,255,255,0.65)",
  },

  barValueGlass: {
    color: "rgba(255,255,255,0.75)",
  },

  dayLabelGlass: {
    color: "rgba(255,255,255,0.6)",
  },

  dayLabelTodayGlass: {
    color: NIGHT.yellow,
  },

});
