import React, { useContext } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";

import { AppContext } from "../context/AppContext";
import { COLORS, NIGHT, SHADOW } from "../constants/theme";
import AppText from "../components/AppText";
import ProgressBar from "../components/ProgressBar";
import BottomNav from "../components/BottomNav";
import NightBackground from "../components/NightBackground";
import AppIcon from "../components/AppIcon";
import { PET_IMAGES } from "../constants/PetImages";
import { getPet } from "../services/PetService";
import { getTranslations } from "../services/TranslationService";

function formatHours(hours) {
  if (typeof hours !== "number" || isNaN(hours)) return "0h";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

export default function HomeScreen({ navigation }) {

  const {

    userName,

    petName,

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

  const petDisplayName =
    petName && petName.trim()
      ? petName
      : pet
        ? t[pet.nameKey]
        : "Michi";

  function greeting() {

    const hour = new Date().getHours();

    if (hour < 12) return t.greetingMorning;

    if (hour < 18) return t.greetingAfternoon;

    return t.greetingEvening;

  }

  return (

    <NightBackground>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* Header */}

        <View style={styles.header}>

          <TouchableOpacity
            style={[styles.circleButton, styles.circleButtonSoft]}
            onPress={() => navigation.navigate("PetShop")}
          >
            <AppIcon name="store" size={22} color="#FFFFFF" />
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

          <TouchableOpacity
            style={[styles.circleButton, styles.circleButtonPurple]}
            onPress={() => navigation.navigate("Menu")}
          >
            <AppIcon name="menu" size={22} color="#FFFFFF" />
          </TouchableOpacity>

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

            <View style={styles.badge}>
              <AppIcon
                name="check"
                size={12}
                color="#2E7D32"
                style={styles.badgeIcon}
              />
              <AppText style={styles.badgeText}>
                {t.goodSleep}
              </AppText>
            </View>

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
          t={t}
          navigation={navigation}
        />
      </View>

    </NightBackground>

  );

}

const styles = StyleSheet.create({

  content: {
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 130,
  },

  // Header

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  headerCenter: {
    flex: 1,
    marginHorizontal: 15,
  },

  greeting: {
    fontSize: 17,
    fontFamily: "Nunito_600SemiBold",
    opacity: 0.9,
  },

  name: {
    fontSize: 26,
    fontFamily: "Nunito_800ExtraBold",
    marginTop: 2,
  },

  circleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },

  circleButtonSoft: {
    backgroundColor: "rgba(255,255,255,0.18)",
  },

  circleButtonPurple: {
    backgroundColor: NIGHT.end,
    elevation: 4,
  },

  // Mascota

  petCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: NIGHT.lavender,
    borderRadius: 28,
    padding: 18,
    marginBottom: 18,
    ...SHADOW.card,
  },

  petImage: {
    width: 130,
    height: 130,
    resizeMode: "contain",
    marginRight: 12,
  },

  petInfo: {
    flex: 1,
  },

  petName: {
    fontSize: 24,
    fontFamily: "Nunito_800ExtraBold",
    color: COLORS.text,
  },

  dialogBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
  },

  dialogText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: "Nunito_600SemiBold",
  },

  happinessRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  happinessIcon: {
    marginRight: 5,
  },

  happiness: {
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    color: "#6C63A8",
  },

  // Stats

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
    ...SHADOW.card,
  },

  statIcon: {
    marginBottom: 6,
  },

  statLabel: {
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
    color: "#8A7FD6",
    letterSpacing: 1,
  },

  statValue: {
    fontSize: 32,
    fontFamily: "Nunito_800ExtraBold",
    color: COLORS.text,
    marginTop: 4,
  },

  statUnit: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    marginTop: 2,
  },

  // Nivel

  levelCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 18,
    marginBottom: 18,
    ...SHADOW.card,
  },

  levelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  levelLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  levelIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: NIGHT.end,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  levelTitle: {
    fontSize: 20,
    fontFamily: "Nunito_800ExtraBold",
    color: COLORS.text,
  },

  levelXp: {
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    color: COLORS.textSecondary,
  },

  levelHint: {
    marginTop: 10,
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: "Nunito_400Regular",
  },

  // Última noche

  lastNightCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 18,
    marginBottom: 18,
    ...SHADOW.card,
  },

  lastNightHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  lastNightTitle: {
    fontSize: 14,
    fontFamily: "Nunito_800ExtraBold",
    color: COLORS.text,
    letterSpacing: 1,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCF5E3",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  badgeIcon: {
    marginRight: 4,
  },

  badgeText: {
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
    color: "#2E7D32",
  },

  lastNightRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  lastNightStat: {
    flex: 1,
    alignItems: "center",
  },

  lastNightIcon: {
    marginBottom: 4,
  },

  lastNightValue: {
    fontSize: 20,
    fontFamily: "Nunito_800ExtraBold",
    color: COLORS.text,
  },

  lastNightLabel: {
    fontSize: 11,
    fontFamily: "Nunito_700Bold",
    color: "#8A7FD6",
    marginTop: 2,
    letterSpacing: 1,
  },

  lastNightDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#EEE7FB",
  },

  lastNightEmpty: {
    textAlign: "center",
    fontSize: 14,
    color: COLORS.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    paddingVertical: 8,
  },

  // Botón principal

  startButton: {
    backgroundColor: NIGHT.end,
    borderRadius: 28,
    paddingVertical: 20,
    alignItems: "center",
    ...SHADOW.card,
  },

  startIcon: {
    marginBottom: 6,
  },

  startTitle: {
    fontSize: 22,
    fontFamily: "Nunito_800ExtraBold",
    color: "#FFFFFF",
    letterSpacing: 1,
  },

  startSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    fontFamily: "Nunito_400Regular",
    marginTop: 4,
  },

  // Navegación inferior

  bottomNav: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 22,
  },

});
