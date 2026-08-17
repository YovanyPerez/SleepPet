import React, {
  useContext,
  useEffect,
  useRef,
} from "react";
import {
  View,
  ScrollView,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppContext } from "../context/AppContext";

import {
  getTranslations,
} from "../services/TranslationService";

import StatCard from "../components/StatCard";
import WeeklyBarChart from "../components/WeeklyBarChart";
import NightChart from "../components/NightChart";
import NightBackground from "../components/NightBackground";
import AppText from "../components/AppText";
import AppIcon from "../components/AppIcon";
import BottomNav from "../components/BottomNav";
import SectionHeader from "../components/SectionHeader";
import MotivationalCard from "../components/MotivationalCard";
import SwipeableTabScreen from "../components/SwipeableTabScreen";
import { NIGHT } from "../constants/theme";
import styles from "./styles/StatisticsScreen.styles";
import {
  toDateKey,
  getWeekDates,
} from "../utils/dateUtils";

const DAY_KEYS = [
  "day_sun",
  "day_mon",
  "day_tue",
  "day_wed",
  "day_thu",
  "day_fri",
  "day_sat",
];

export default function StatisticsScreen({ navigation }) {

  const {
    language,
    sleepHistory,
    goalHours,
  } = useContext(AppContext);

  const t = getTranslations(language);

  const appear = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(appear, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [appear]);

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

  const fadeOpacity = appear.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const fadeTranslate = appear.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  return (

    <SwipeableTabScreen active="Statistics" navigation={navigation}>

    <NightBackground moon={false}>

      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >

          <Animated.View
            style={{
              opacity: fadeOpacity,
              transform: [{ translateY: fadeTranslate }],
            }}
          >

            {/* Header */}

            <View style={styles.header}>

              <View style={styles.headerIconCircle}>
                <AppIcon name="statistics" size={24} color={NIGHT.yellow} />
              </View>

              <View style={styles.headerText}>

                <AppText style={styles.title}>
                  {t.statistics}
                </AppText>

                <AppText style={styles.subtitle}>
                  {t.statisticsSubtitle}
                </AppText>

              </View>

            </View>

            {
              nights === 0 ? (

                <View style={styles.emptyCard}>

                  <AppIcon
                    name="night"
                    size={36}
                    color={NIGHT.yellow}
                    style={styles.emptyIcon}
                  />

                  <AppText style={styles.emptyTitle}>
                    {t.noStatsTitle}
                  </AppText>

                  <AppText style={styles.emptyMessage}>
                    {t.noStatsMessage}
                  </AppText>

                </View>

              ) : (

                <>

                  {/* Sueño de esta semana */}

                  <SectionHeader
                    icon="night"
                    title={t.weeklySleep}
                  />

                  <WeeklyBarChart
                    data={weeklyData}
                    goalHours={goalHours}
                    goalLabel={t.goal}
                  />

                  {/* Despertares de la última noche */}

                  {
                    latestSessionHasChart && (
                      <View>

                        <SectionHeader
                          icon="night"
                          title={t.nightWakeups}
                        />

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

                  {/* Grid de estadísticas */}

                  <View style={styles.grid}>

                    <StatCard
                      icon="sleep"
                      iconColor="#7C6FD0"
                      label={t.average}
                      value={`${averageSleep} h`}
                      sub={t.ofSleep}
                    />

                    <StatCard
                      icon="night"
                      iconColor={NIGHT.yellow}
                      label={t.best}
                      value={`${maxHours} h`}
                      sub={t.ofSleep}
                    />

                    <StatCard
                      icon="coins"
                      iconColor="#F59E0B"
                      label={t.coins}
                      value={coins}
                      sub={t.totalSub}
                    />

                    <StatCard
                      icon="calendar"
                      iconColor="#5E60CE"
                      label={t.nights}
                      value={nights}
                      sub={t.registered}
                    />

                    <StatCard
                      icon="score"
                      iconColor="#5E60CE"
                      label={t.averageScore}
                      value={averageScore}
                      sub={t.ofSleep}
                    />

                    <StatCard
                      icon="trophy"
                      iconColor="#FFB703"
                      label={t.bestScore}
                      value={best}
                      sub={t.ofSleep}
                    />

                    <StatCard
                      icon="level"
                      iconColor={NIGHT.yellow}
                      label={t.totalXP}
                      value={xp}
                      sub={t.earnedSub}
                    />

                    <StatCard
                      icon="sparkles"
                      iconColor={NIGHT.pink}
                      label={t.perfect}
                      value={perfect}
                      sub={t.withoutWakeups}
                    />

                  </View>

                  {/* Motivación */}

                  <MotivationalCard t={t} />

                </>

              )
            }

          </Animated.View>

        </ScrollView>

        {/* Navegación inferior */}

        <View style={styles.bottomNav}>
          <BottomNav
            active="Statistics"
            navigation={navigation}
          />
        </View>

      </SafeAreaView>

    </NightBackground>

    </SwipeableTabScreen>

  );

}

