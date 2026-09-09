import React, { useContext, useState, useEffect, useRef } from "react";
import {
  ScrollView,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRoute } from "@react-navigation/native";

import { AppContext } from "../context/AppContext";
import { NIGHT } from "../constants/theme";
import AppText from "../components/AppText";
import ProgressBar from "../components/ProgressBar";
import BottomNav from "../components/BottomNav";
import OnboardingOverlay from "../components/OnboardingOverlay";
import NightBackground from "../components/NightBackground";
import AppIcon from "../components/AppIcon";
import SwipeableTabScreen from "../components/SwipeableTabScreen";
import { PET_IMAGES } from "../constants/PetImages";
import { getPet } from "../services/PetService";
import { getTranslations } from "../services/TranslationService";
import styles from "./styles/HomeScreen.styles";

function formatHours(hours) {
  if (typeof hours !== "number" || isNaN(hours)) return "0h";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

export default function HomeScreen({ navigation }) {

  const {

    userName,

    petNames,

    streak,

    coins,

    petMood,
    petHappiness,

    selectedPet,

    level,
    xp,

    lastSleepSession,

    language,

    setHasCompletedOnboarding,

  } = useContext(AppContext);

  const t = getTranslations(language);

  const route = useRoute();

  const pet = getPet(selectedPet);

  const petName = petNames?.[selectedPet] || "";

  const petDisplayName =
    petName && petName.trim()
      ? petName
      : pet
        ? t[pet.nameKey]
        : "Michi";

  // Badge dinámico según el estado de la última sesión
  const MOOD_BADGES = {
    happy: { label: t.excellentSleep, text: "#2E7D32", bg: "#E8F5E9" },
    normal: { label: t.goodSleep, text: "#2E7D32", bg: "#E8F5E9" },
    sleepy: { label: t.needMoreRest, text: "#B45309", bg: "#FEF3C7" },
    sad: { label: t.trySleepingLonger, text: "#B91C1C", bg: "#FEE2E2" },
  };

  const moodBadge = lastSleepSession
    ? MOOD_BADGES[lastSleepSession.mood] || MOOD_BADGES.normal
    : null;

  function greeting() {

    const hour = new Date().getHours();

    if (hour < 12) return t.greetingMorning;

    if (hour < 18) return t.greetingAfternoon;

    return t.greetingEvening;

  }

  // ===========================
  // Onboarding guiado (spotlight real, sin coordenadas fijas):
  // cada target se mide con onLayout y se compone por cadena hasta el
  // espacio del NightBackground; el ScrollView compensa su scrollY.
  // Sin medición válida NO hay tooltip (condición de arquitectura).
  // ===========================

  const ONBOARDING_STEPS = [
    { key: "pet", icon: "paw", title: t.onboardingPetTitle, body: t.onboardingPetBody },
    { key: "streak", icon: "streak", title: t.onboardingStreakTitle, body: t.onboardingStreakBody },
    { key: "level", icon: "level", title: t.onboardingLevelTitle, body: t.onboardingLevelBody },
    { key: "sleep", icon: "night", title: t.onboardingSleepTitle, body: t.onboardingSleepBody },
    { key: "tabStats", icon: "statistics", title: t.onboardingStatsTitle, body: t.onboardingStatsBody, lift: 90 },
    { key: "tabAch", icon: "achievements", title: t.onboardingAchievementsTitle, body: t.onboardingAchievementsBody, lift: 90 },
  ];

  const [guideStep, setGuideStep] = useState(-1);
  const [guideFirstRun, setGuideFirstRun] = useState(false);
  const [frames, setFrames] = useState({});
  const [scrollY, setScrollY] = useState(0);
  const [tick, setTick] = useState(0);
  const scrollRef = useRef(null);

  const setFrame = (key) => (e) => {
    const { x, y, width, height } = e.nativeEvent.layout;
    setFrames((prev) => {
      const cur = prev[key];
      if (cur && cur.x === x && cur.y === y && cur.width === width && cur.height === height) {
        return prev;
      }
      return { ...prev, [key]: { x, y, width, height } };
    });
  };

  // Disparo explícito únicamente: showOnboarding (perfil recién creado) o
  // replayGuide (Settings "Ver guía"). Nunca automático para existentes.
  useEffect(() => {
    const p = route.params || {};
    if (p.showOnboarding || p.replayGuide) {
      setGuideFirstRun(!!p.showOnboarding);
      setGuideStep(0);
      navigation.setParams({ showOnboarding: false, replayGuide: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params]);

  // Recalcula al cambiar de paso y al volver a focus (rotación/tamaño)
  useEffect(() => {
    const unsub = navigation.addListener("focus", () => {
      setTick((v) => v + 1);
    });
    return unsub;
  }, [navigation]);

  useEffect(() => {
    if (guideStep < 0) return;
    const id = setTimeout(() => setTick((v) => v + 1), 400);
    return () => clearTimeout(id);
  }, [guideStep]);

  function targetRect() {
    if (guideStep < 0 || guideStep >= ONBOARDING_STEPS.length) return null;
    const key = ONBOARDING_STEPS[guideStep].key;
    // Tabs: wrapper + barra + tab (todo medido con onLayout)
    if (key === "tabStats" || key === "tabAch") {
      const w = frames.__tabsWrap;
      const b = frames.__bar;
      const tb = frames[key];
      if (!w || !b || !tb) return null;
      return {
        x: w.x + b.x + tb.x,
        y: w.y + b.y + tb.y,
        width: tb.width,
        height: tb.height,
      };
    }
    // Contenido con scroll: scrollview + target − scrollY
    const s = frames.__scroll;
    const f = frames[key];
    if (!s || !f) return null;
    return {
      x: s.x + f.x,
      y: s.y + f.y - scrollY,
      width: f.width,
      height: f.height,
    };
  }

  const guideRect = targetRect();
  const guideLayouts = guideRect
    ? { [ONBOARDING_STEPS[guideStep].key]: guideRect }
    : {};

  // Lleva el target al área visible antes de mostrar el tooltip
  useEffect(() => {
    if (guideStep < 0 || !guideRect || !scrollRef.current) return;
    const winH = Dimensions.get("window").height;
    if (guideRect.y < 90 || guideRect.y + guideRect.height > winH - 200) {
      scrollRef.current.scrollTo({
        y: Math.max(0, scrollY + guideRect.y - winH * 0.35),
        animated: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guideStep, tick]);

  function endGuide(toSetup) {
    setGuideStep(-1);
    setHasCompletedOnboarding(true);
    if (toSetup) {
      // navigate (no replace): la pila queda [Home, SleepSetup] y el botón
      // físico atrás vuelve a Home en vez de cerrar la app.
      navigation.navigate("SleepSetup", { firstRun: true });
    }
  }

  return (

    <SwipeableTabScreen active="Home" navigation={navigation}>

    <NightBackground>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onLayout={setFrame("__scroll")}
        scrollEnabled={guideStep < 0}
        scrollEventThrottle={16}
        onScroll={(e) => setScrollY(e.nativeEvent.contentOffset.y)}
      >

        {/* Header */}

        <View style={styles.header}>

          <TouchableOpacity
            style={[styles.circleButton, styles.circleButtonPurple]}
            onPress={() => navigation.navigate("Menu")}
          >
            <AppIcon name="menu" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>

            <AppText
              color={NIGHT.textOnNight}
              style={styles.greeting}
            >
              {greeting()}
            </AppText>

            <AppText
              color={NIGHT.textOnNight}
              style={styles.name}
            >
              {userName || t.player}
            </AppText>

          </View>

          <View style={styles.headerSpacer} />

        </View>

        {/* Mascota */}

        <View style={styles.petCard} onLayout={setFrame("pet")}>

          <Image
            source={PET_IMAGES[selectedPet][petMood]}
            style={styles.petImage}
          />

          <View style={styles.petInfo}>

            <AppText style={styles.petName}>
              {petDisplayName}
            </AppText>

            <View style={styles.dialogBubble}>
              <AppText style={styles.dialogText}>
                {t.petDialog}
              </AppText>
            </View>

            <View style={styles.happinessRow}>
              <AppIcon
                name="happiness"
                size={13}
                color="#6C63A8"
                style={styles.happinessIcon}
              />
              <AppText style={styles.happiness}>
                {t.happiness} {petHappiness}%
              </AppText>
            </View>

            <ProgressBar
              progress={petHappiness}
              color={NIGHT.pink}
              background="#D8D2F0"
              height={10}
            />

          </View>

        </View>

        {/* Streak / Coins */}

        <View style={styles.statsRow} onLayout={setFrame("streak")}>

          <View style={styles.statCard}>

            <AppIcon
              name="streak"
              size={30}
              color="#F97316"
              style={styles.statIcon}
            />

            <AppText style={styles.statLabel}>
              {t.streak.toUpperCase()}
            </AppText>

            <AppText style={styles.statValue}>
              {streak}
            </AppText>

            <AppText style={styles.statUnit}>
              {t.days}
            </AppText>

          </View>

          <View style={styles.statCard}>

            <AppIcon
              name="coins"
              size={30}
              color="#F59E0B"
              style={styles.statIcon}
            />

            <AppText style={styles.statLabel}>
              {t.coins.toUpperCase()}
            </AppText>

            <AppText style={styles.statValue}>
              {coins}
            </AppText>

            <AppText style={styles.statUnit}>
              {t.coins}
            </AppText>

          </View>

        </View>

        {/* Nivel */}

        <View style={styles.levelCard} onLayout={setFrame("level")}>

          <View style={styles.levelHeader}>

            <View style={styles.levelLeft}>

              <View style={styles.levelIconCircle}>
                <AppIcon name="level" size={24} color={NIGHT.yellow} />
              </View>

              <AppText style={styles.levelTitle}>
                {t.level} {level}
              </AppText>

            </View>

            <AppText style={styles.levelXp}>
              {xp} / 100 {t.xp}
            </AppText>

          </View>

          <ProgressBar
            progress={xp}
            color={NIGHT.yellow}
            background="#EEE7FB"
            height={12}
          />

          <AppText style={styles.levelHint}>
            {t.levelHint}
          </AppText>

        </View>

        {/* Última noche */}

        <View style={styles.lastNightCard}>

          <View style={styles.lastNightHeader}>

            <AppText style={styles.lastNightTitle}>
              {t.lastNight}
            </AppText>

            {
              moodBadge && (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: moodBadge.bg },
                  ]}
                >
                  <AppIcon
                    name="check"
                    size={12}
                    color={moodBadge.text}
                    style={styles.badgeIcon}
                  />
                  <AppText
                    style={[
                      styles.badgeText,
                      { color: moodBadge.text },
                    ]}
                  >
                    {moodBadge.label}
                  </AppText>
                </View>
              )
            }

          </View>

          {
            lastSleepSession ? (

              <View style={styles.lastNightRow}>

                <View style={styles.lastNightStat}>
                  <AppIcon
                    name="sleep"
                    size={20}
                    color="#7C6FD0"
                    style={styles.lastNightIcon}
                  />
                  <AppText style={styles.lastNightValue}>
                    {formatHours(lastSleepSession.hours)}
                  </AppText>
                  <AppText style={styles.lastNightLabel}>
                    {t.sleepLabel}
                  </AppText>
                </View>

                <View style={styles.lastNightDivider} />

                <View style={styles.lastNightStat}>
                  <AppIcon
                    name="score"
                    size={20}
                    color="#5E60CE"
                    style={styles.lastNightIcon}
                  />
                  <AppText style={styles.lastNightValue}>
                    {lastSleepSession.score}
                  </AppText>
                  <AppText style={styles.lastNightLabel}>
                    {t.scoreLabel}
                  </AppText>
                </View>

                <View style={styles.lastNightDivider} />

                <View style={styles.lastNightStat}>
                  <AppIcon
                    name="unlocks"
                    size={20}
                    color="#5E60CE"
                    style={styles.lastNightIcon}
                  />
                  <AppText style={styles.lastNightValue}>
                    {lastSleepSession.unlockCount}
                  </AppText>
                  <AppText style={styles.lastNightLabel}>
                    {t.unlocksLabel}
                  </AppText>
                </View>

              </View>

            ) : (

              <AppText style={styles.lastNightEmpty}>
                {t.noDataYet}
              </AppText>

            )
          }

        </View>

        {/* START SLEEP */}

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => navigation.navigate("SleepMode")}
          onLayout={setFrame("sleep")}
        >

          <AppIcon
            name="night"
            size={26}
            color={NIGHT.yellow}
            style={styles.startIcon}
          />

          <AppText style={styles.startTitle}>
            {t.startSleep.toUpperCase()}
          </AppText>

          <AppText style={styles.startSubtitle}>
            {t.startSleepSubtitle}
          </AppText>

        </TouchableOpacity>

      </ScrollView>

      {/* Navegación inferior */}

      <View style={styles.bottomNav} onLayout={setFrame("__tabsWrap")}>
        <BottomNav
          active="Home"
          navigation={navigation}
          onTabLayout={(key, layout) => {
            const k = key === "Statistics" ? "tabStats" : key === "Achievements" ? "tabAch" : null;
            if (k) setFrame(k)({ nativeEvent: { layout } });
            else if (key === "__bar") setFrame("__bar")({ nativeEvent: { layout } });
          }}
        />
      </View>

      {guideStep >= 0 && (
        <OnboardingOverlay
          steps={ONBOARDING_STEPS}
          stepIndex={guideStep}
          layouts={guideLayouts}
          onBack={() => setGuideStep((s) => Math.max(0, s - 1))}
          onNext={() => setGuideStep((s) => Math.min(ONBOARDING_STEPS.length - 1, s + 1))}
          onSkip={() => endGuide(guideFirstRun)}
          onFinish={() => endGuide(guideFirstRun)}
          t={t}
        />
      )}

    </NightBackground>

    </SwipeableTabScreen>

  );

}

