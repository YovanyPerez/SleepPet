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
import { movementLevel } from "../services/MovementService";

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

  // Promedios de pulso y movimiento: solo sesiones que tienen el dato
  // (retrocompatible) y sin siestas — son métricas nocturnas
  const bpmSessions = history.filter(
    (s) => typeof s.preSleepBpm === "number" && s.preSleepBpm > 0 && !s.isNap
  );

  const movementSessions = history.filter(
    (s) => s.movementEvents != null && !s.isNap
  );

  const avgBpm =
    bpmSessions.length > 0
      ? Math.round(
          bpmSessions.reduce((a, s) => a + s.preSleepBpm, 0) /
            bpmSessions.length
        )
      : null;

  const avgMovementEvents =
    movementSessions.length > 0
      ? Math.round(
          (movementSessions.reduce((a, s) => a + s.movementEvents, 0) /
            movementSessions.length) *
            10
        ) / 10
      : null;

  const avgMovementScore =
    movementSessions.length > 0
      ? movementSessions.reduce((a, s) => a + (s.movementScore ?? 0), 0) /
        movementSessions.length
      : null;

  // Fase C Smart Sleep: sesiones con estimatedStages (ventanas 30s WAKE/LIGHT/DEEP)
  const smartSessions = history.filter(
    (s) => s.estimatedStages && typeof s.estimatedStages.wake === "number" && !s.isNap
  );
  let avgWake = null, avgLight = null, avgDeep = null;
  if (smartSessions.length > 0) {
    avgWake = Math.round(smartSessions.reduce((a, s) => a + (s.estimatedStages.wake ?? 0), 0) / smartSessions.length);
    avgLight = Math.round(smartSessions.reduce((a, s) => a + (s.estimatedStages.light ?? 0), 0) / smartSessions.length);
    avgDeep = Math.round(smartSessions.reduce((a, s) => a + (s.estimatedStages.deep ?? 0), 0) / smartSessions.length);
  }

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

                    {
                      avgBpm != null && (
                        <StatCard
                          icon="heartPulse"
                          iconColor="#FF8FAB"
                          label={t.statsAvgBpm}
                          value={avgBpm}
                          sub={t.statsAvgBpmSub}
                        />
                      )
                    }

                    {
                      avgMovementEvents != null && (
                        <StatCard
                          icon="movement"
                          iconColor="#C9B8E8"
                          label={t.movementTitle}
                          value={avgMovementEvents}
                          sub={movementLevel(avgMovementScore, t) ?? t.statsPerNight}
                        />
                      )
                    }

                    {
                      smartSessions.length > 0 && (
                        <>
                          <StatCard
                            icon="night"
                            iconColor="#8FA3FF"
                            label={(t.smartSleepDeep ?? "Sueño profundo*")}
                            value={`${avgDeep} min`}
                            sub={(t.smartSleepAvgSub ?? "*estimado")}
                          />
                          <StatCard
                            icon="night"
                            iconColor="#FFD166"
                            label={(t.smartSleepLight ?? "Sueño ligero*")}
                            value={`${avgLight} min`}
                            sub={(t.smartSleepAvgSub ?? "*estimado")}
                          />
                          <StatCard
                            icon="movement"
                            iconColor="#FF8FAB"
                            label={(t.smartSleepWake ?? "Despierto*")}
                            value={`${avgWake} min`}
                            sub={(t.smartSleepAvgSub ?? "*estimado")}
                          />
                        </>
                      )
                    }

                  </View>

                  {/* Hipnograma estimado última noche */}
                  {latestSession?.smartWindows?.length > 0 && (
                    <View style={{ marginTop: 16 }}>
                      <SectionHeader icon="night" title={t.smartSleepHipnogram ?? "Hipnograma estimado*"} />
                      <View style={{ backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 16, padding: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" }}>
                        <View style={{ flexDirection: "row", height: 60, alignItems: "flex-end", gap: 2 }}>
                          {latestSession.smartWindows.slice(-48).map((w, idx) => {
                            const stage = w.stage ?? "LIGHT";
                            const h = stage === "DEEP" ? 18 : stage === "LIGHT" ? 36 : 60;
                            const col = stage === "DEEP" ? "#8FA3FF" : stage === "LIGHT" ? "#FFD166" : "#FF8FAB";
                            return <View key={idx} style={{ flex: 1, height: h, backgroundColor: col, borderRadius: 2, opacity: 0.85 }} />;
                          })}
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
                          <AppText style={{ color: "#FF8FAB", fontSize: 10, fontFamily: "Nunito_600SemiBold" }}>WAKE</AppText>
                          <AppText style={{ color: "#FFD166", fontSize: 10, fontFamily: "Nunito_600SemiBold" }}>LIGHT</AppText>
                          <AppText style={{ color: "#8FA3FF", fontSize: 10, fontFamily: "Nunito_600SemiBold" }}>DEEP</AppText>
                        </View>
                        <AppText style={{ color: "rgba(255,255,255,0.5)", fontSize: 9, textAlign: "center", marginTop: 4 }}>
                          {t.smartSleepDisclaimerSmall ?? "*Estimación por reglas movimiento+audio, no diagnóstico médico"}
                        </AppText>
                      </View>
                    </View>
                  )}

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

