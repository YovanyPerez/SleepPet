import React, { useContext } from "react";
import {
  ScrollView,
  View,
  Image,
  TouchableOpacity,
} from "react-native";

import { AppContext } from "../context/AppContext";
import { NIGHT } from "../constants/theme";
import AppText from "../components/AppText";
import ProgressBar from "../components/ProgressBar";
import BottomNav from "../components/BottomNav";
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

  } = useContext(AppContext);

  const t = getTranslations(language);

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

  return (

    <SwipeableTabScreen active="Home" navigation={navigation}>

    <NightBackground>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
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

        <View style={styles.petCard}>

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

        <View style={styles.statsRow}>

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

        <View style={styles.levelCard}>

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

      <View style={styles.bottomNav}>
        <BottomNav
          active="Home"
          navigation={navigation}
        />
      </View>

    </NightBackground>

    </SwipeableTabScreen>

  );

}

