import React, { useContext } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
} from "react-native";

import { AppContext } from "../context/AppContext";

import {
  getTranslations,
} from "../services/TranslationService";

import StatCard from "../components/StatCard";
import WeeklyBarChart from "../components/WeeklyBarChart";
import NightChart from "../components/NightChart";
import {
  toDateKey,
  getWeekDates,
} from "../utils/dateUtils";

import ScreenContainer from "../components/ScreenContainer";
import AppText from "../components/AppText";

const DAY_KEYS = [
  "day_sun",
  "day_mon",
  "day_tue",
  "day_wed",
  "day_thu",
  "day_fri",
  "day_sat",
];

export default function StatisticsScreen() {

  const {
    language,
    sleepHistory,
    goalHours,
  } = useContext(AppContext);

  const t = getTranslations(language);

  const history = sleepHistory;

  let totalHours = 0;
  let maxHours = 0;
  let coins = 0;
  let score = 0;
  let best = 0;
  let perfect = 0;
  let xp = 0;

  history.forEach((session) => {

    totalHours += session.hours;
    coins += session.coins;
    score += session.score;
    xp += session.earnedXP;

    if (session.hours > maxHours) {
      maxHours = session.hours;
    }

    if (session.score > best) {
      best = session.score;
    }

    if (session.score >= 90) {
      perfect++;
    }

  });

  const nights = history.length;

  const averageSleep =
    nights > 0
      ? (totalHours / nights).toFixed(1)
      : "0";

  const averageScore =
    nights > 0
      ? Math.round(score / nights)
      : 0;

  const latestSession = history[0];

  const latestSessionHasChart =
    latestSession &&
    typeof latestSession.startMs === "number" &&
    typeof latestSession.endMs === "number";

  const todayKey = toDateKey(new Date());

  const weeklyData = getWeekDates().map((date) => {

    const key = toDateKey(date);

    let value = 0;

    history.forEach((session) => {

      if (session.dateKey === key) {
        value += session.hours;
      }

    });

    return {
      key,
      value: Math.round(value * 10) / 10,
      isToday: key === todayKey,
      label: t[DAY_KEYS[date.getDay()]],
    };

  });

  return (

    <ScreenContainer style={styles.screen}>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        <AppText
          variant="title"
          center
          style={styles.title}
        >
          📊 {t.statistics}
        </AppText>

        <AppText style={styles.chartTitle}>
          🌙 {t.weeklySleep}
        </AppText>

        <WeeklyBarChart
          data={weeklyData}
          goalHours={goalHours}
          goalLabel={t.goal}
        />

        {
          latestSessionHasChart && (
            <View>

              <AppText style={styles.chartTitle}>
                🌙 {t.nightWakeups}
              </AppText>

              <NightChart
                startMs={latestSession.startMs}
                endMs={latestSession.endMs}
                unlockTimes={latestSession.unlockTimes || []}
                countLabel={`${latestSession.unlockCount || 0} ${t.phoneUnlocks}`}
                emptyLabel={t.noWakeups}
              />

            </View>
          )
        }

        <View style={styles.grid}>

          <StatCard
            icon="😴"
            label={t.average}
            value={`${averageSleep} h`}
          />

          <StatCard
            icon="🌙"
            label={t.best}
            value={`${maxHours} h`}
          />

          <StatCard
            icon="💰"
            label={t.coins}
            value={coins}
          />

          <StatCard
            icon="📅"
            label={t.nights}
            value={nights}
          />

          <StatCard
            icon="💯"
            label={t.averageScore}
            value={averageScore}
          />

          <StatCard
            icon="🏆"
            label={t.bestScore}
            value={best}
          />

          <StatCard
            icon="⭐"
            label={t.totalXP}
            value={xp}
          />

          <StatCard
            icon="🌟"
            label={t.perfect}
            value={perfect}
          />

        </View>

      </ScrollView>

    </ScreenContainer>

  );

}

const styles = StyleSheet.create({

  screen: {
    padding: 0,
  },

  container: {
    flex: 1,
    padding: 20,
  },

  content: {
    paddingBottom: 40,
  },

  title: {
    marginBottom: 22,
  },

  chartTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

});
