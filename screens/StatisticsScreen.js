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
import SectionHeader from "../components/SectionHeader";
import MotivationalCard from "../components/MotivationalCard";
import CheckInCard from "../components/CheckInCard";
import { NIGHT } from "../constants/theme";
import {
  analyzeSleepStudy,
} from "../services/CheckInService";
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
    dailyCheckIns,
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
  let score = 0;
  let perfect = 0;

  history.forEach((session) => {

    totalHours += session.hours;
    score += session.score;

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

  const avgBpm =
    bpmSessions.length > 0
      ? Math.round(
          bpmSessions.reduce((a, s) => a + s.preSleepBpm, 0) /
            bpmSessions.length
        )
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

  // ===========================
  // Sleep & Study (descriptivo, nunca causal)
  // ===========================

  const study = analyzeSleepStudy({
    sleepHistory: history,
    checkIns: dailyCheckIns,
  });

  let observation = null;
  if (study.sleepEnergyRelation) {
    const rel = study.sleepEnergyRelation;
    if (
      study.consistency != null &&
      study.consistency < 1 &&
      rel.highEnergyAvgHours > rel.lowEnergyAvgHours + 0.5
    ) {
      observation = t.sleepStudyObsEnergeticConsistent;
    } else if (rel.highEnergyAvgHours > rel.lowEnergyAvgHours + 0.5) {
      observation = t.sleepStudyObsBetterEnergy;
    }
  }
  if (!observation && study.consistency != null && study.consistency < 1) {
    observation = t.sleepStudyObsConsistent;
  }

  return (

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

                  {/* Héroe: semana + headline (promedio y meta dentro del gráfico) */}

                  <SectionHeader
                    icon="night"
                    title={t.weeklySleep}
                  />

                  <WeeklyBarChart
                    data={weeklyData}
                    goalHours={goalHours}
                    goalLabel={t.goal}
                    variant="glass"
                    headline={`${averageSleep} h`}
                    headlineSub={`${t.ofSleep} · ${t.goal}: ${goalHours}h`}
                  />

                  {/* Anoche: despertares + fases en una sola card */}

                  {
                    (latestSessionHasChart || (latestSession?.smartWindows?.length > 0)) && (
                      <View>

                        <SectionHeader
                          icon="night"
                          title={t.lastNight}
                        />

                        <View style={styles.lastNightCard}>

                          {
                            latestSessionHasChart && (
                              <NightChart
                                startMs={latestSession.startMs}
                                endMs={latestSession.endMs}
                                unlockTimes={latestSession.unlockTimes || []}
                                countLabel={`${latestSession.unlockCount || 0} ${t.phoneUnlocks}`}
                                emptyLabel={t.noWakeups}
                                bare
                              />
                            )
                          }

                          {
                            latestSessionHasChart && latestSession?.smartWindows?.length > 0 && (
                              <View style={styles.lastNightDivider} />
                            )
                          }

                          {
                            latestSession?.smartWindows?.length > 0 && (
                              <View>
                                <View style={styles.hipnoBars}>
                                  {latestSession.smartWindows.slice(-48).map((w, idx) => {
                                    const stage = w.stage ?? "LIGHT";
                                    const h = stage === "DEEP" ? 18 : stage === "LIGHT" ? 36 : 60;
                                    const col = stage === "DEEP" ? "#8FA3FF" : stage === "LIGHT" ? "#FFD166" : "#FF8FAB";
                                    return <View key={idx} style={[styles.hipnoBar, { height: h, backgroundColor: col }]} />;
                                  })}
                                </View>
                                <View style={styles.hipnoLegend}>
                                  <AppText style={[styles.hipnoLegendText, { color: "#FF8FAB" }]}>{t.smartSleepWakePlain}</AppText>
                                  <AppText style={[styles.hipnoLegendText, { color: "#FFD166" }]}>{t.phaseLight}</AppText>
                                  <AppText style={[styles.hipnoLegendText, { color: "#8FA3FF" }]}>{t.phaseDeep}</AppText>
                                </View>
                                <AppText style={styles.hipnoDisclaimer}>
                                  {t.smartSleepDisclaimerSmall ?? "*Estimación por reglas movimiento+audio, no diagnóstico médico"}
                                </AppText>
                              </View>
                            )
                          }

                        </View>

                      </View>
                    )
                  }

                  {/* Fases estimadas: 1 card con 3 filas */}

                  {
                    smartSessions.length > 0 && (
                      <View>

                        <SectionHeader
                          icon="movement"
                          title={t.smartSleepPhases}
                          small
                        />

                        <View style={styles.phasesCard}>
                          <View style={styles.phaseRow}>
                            <View style={[styles.phaseDot, { backgroundColor: "#8FA3FF" }]} />
                            <AppText style={styles.phaseLabel}>{t.smartSleepDeep}</AppText>
                            <AppText style={styles.phaseValue}>{`${avgDeep} min`}</AppText>
                          </View>
                          <View style={styles.phaseRow}>
                            <View style={[styles.phaseDot, { backgroundColor: "#FFD166" }]} />
                            <AppText style={styles.phaseLabel}>{t.smartSleepLight}</AppText>
                            <AppText style={styles.phaseValue}>{`${avgLight} min`}</AppText>
                          </View>
                          <View style={[styles.phaseRow, styles.phaseRowLast]}>
                            <View style={[styles.phaseDot, { backgroundColor: "#FF8FAB" }]} />
                            <AppText style={styles.phaseLabel}>{t.smartSleepWake}</AppText>
                            <AppText style={styles.phaseValue}>{`${avgWake} min`}</AppText>
                          </View>
                          <AppText style={styles.phasesSub}>{t.smartSleepAvgSub ?? "*estimado"}</AppText>
                        </View>

                      </View>
                    )
                  }

                  {/* Grid curado: score, pulso y noches perfectas */}

                  <View style={styles.grid}>

                    <StatCard
                      icon="score"
                      iconColor="#FFD166"
                      label={t.averageScore}
                      value={averageScore}
                      sub={t.ofSleep}
                      variant="glass"
                    />

                    {
                      avgBpm != null && (
                        <StatCard
                          icon="heartPulse"
                          iconColor="#FF8FAB"
                          label={t.statsAvgBpm}
                          value={avgBpm}
                          sub={t.statsAvgBpmSub}
                          variant="glass"
                        />
                      )
                    }

                    <StatCard
                      icon="sparkles"
                      iconColor="#FFD166"
                      label={t.perfect}
                      value={perfect}
                      sub={t.withoutWakeups}
                      variant="glass"
                    />

                  </View>

                </>

              )
            }

            {/* Sleep & Study — Daily Check-in + análisis descriptivo (nunca causal) */}

            <View style={styles.sleepStudySection}>

              <SectionHeader icon="sparkles" title={t.sleepAndStudy} />

              <CheckInCard />

              {
                study.tier === "none" ? (
                  <View style={styles.emptyCard}>
                    <AppIcon
                      name="sparkles"
                      size={30}
                      color={NIGHT.yellow}
                      style={styles.emptyIcon}
                    />
                    <AppText style={styles.emptyTitle}>
                      {t.sleepStudyNotEnough}
                    </AppText>
                  </View>
                ) : (
                  <>
                    <AppText style={styles.sleepStudyTier}>
                      {study.tier === "weekly" ? t.sleepStudyWeekly : t.sleepStudyEarly}
                    </AppText>

                    {
                      observation && (
                        <View style={styles.sleepStudyObs}>
                          <AppText style={styles.sleepStudyObsText}>
                            {observation}
                          </AppText>
                        </View>
                      )
                    }

                    <AppText style={styles.sleepStudyDisclaimer}>
                      {t.sleepStudyDisclaimer}
                    </AppText>
                  </>
                )
              }

            </View>

            {/* Motivación al final, después de los datos */}

            <View style={styles.motivationWrap}>
              <MotivationalCard t={t} />
            </View>

          </Animated.View>

        </ScrollView>

      </SafeAreaView>

    </NightBackground>

  );

}

