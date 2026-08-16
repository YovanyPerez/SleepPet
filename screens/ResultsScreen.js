import React, {
  useContext,
  useEffect,
  useRef,
} from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppContext } from "../context/AppContext";
import { NIGHT } from "../constants/theme";
import { PET_IMAGES } from "../constants/PetImages";
import {
  getTranslations,
} from "../services/TranslationService";

import NightBackground from "../components/NightBackground";
import AppText from "../components/AppText";
import AppIcon from "../components/AppIcon";

export default function ResultsScreen({ navigation }) {

  const {

    lastSleepSession,

    selectedPet,

    language,

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

  const fadeOpacity = appear.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const fadeTranslate = appear.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  if (!lastSleepSession) {

    return (

      <NightBackground moon={false}>

        <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>

          <View style={styles.emptyWrap}>

            <AppText style={styles.empty}>
              {t.noSleepSession}
            </AppText>

          </View>

        </SafeAreaView>

      </NightBackground>

    );

  }

  function getTitle() {

    switch (lastSleepSession.mood) {

      case "happy":
        return t.excellentSleep;

      case "normal":
        return t.goodSleep;

      case "sleepy":
        return t.needMoreRest;

      default:
        return t.trySleepingLonger;

    }

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

            {/* Título */}

            <AppText style={styles.title}>
              {getTitle()}
            </AppText>

            {/* Mascota */}

            <View style={styles.petWrap}>

              <View style={styles.petGlow} />

              <Image
                source={PET_IMAGES[selectedPet][lastSleepSession.mood]}
                style={styles.pet}
              />

            </View>

            {/* Métricas */}

            <View style={styles.metricCard}>

              <View style={styles.metricIcon}>
                <AppIcon name="night" size={20} color={NIGHT.yellow} />
              </View>

              <AppText style={styles.metricLabel}>
                {t.sleepTime}
              </AppText>

              <AppText style={styles.metricValue}>
                {lastSleepSession.hours} {t.hours}
              </AppText>

            </View>

            <View style={styles.metricCard}>

              <View style={styles.metricIcon}>
                <AppIcon name="sleep" size={20} color="#8FA3FF" />
              </View>

              <AppText style={styles.metricLabel}>
                {t.sleepQuality}
              </AppText>

              <AppText style={styles.metricValue}>
                {lastSleepSession.quality}
              </AppText>

            </View>

            <View style={styles.metricCard}>

              <View style={styles.metricIcon}>
                <AppIcon name="score" size={20} color="#C9B8E8" />
              </View>

              <AppText style={styles.metricLabel}>
                {t.sleepScore}
              </AppText>

              <AppText style={styles.metricValue}>
                {lastSleepSession.score}/100
              </AppText>

            </View>

            <View style={styles.metricCard}>

              <View style={styles.metricIcon}>
                <AppIcon name="unlocks" size={20} color="#8FA3FF" />
              </View>

              <AppText style={styles.metricLabel}>
                {t.phoneUnlocks}
              </AppText>

              <AppText style={styles.metricValue}>
                {lastSleepSession.unlockCount}
              </AppText>

            </View>

            <View style={styles.metricCard}>

              <View style={styles.metricIcon}>
                <AppIcon name="warning" size={20} color={NIGHT.pink} />
              </View>

              <AppText style={styles.metricLabel}>
                {t.penalty}
              </AppText>

              <AppText style={styles.metricValue}>
                {lastSleepSession.penalty > 0
                  ? `-${lastSleepSession.penalty}`
                  : t.none}
              </AppText>

            </View>

            {/* Recompensas */}

            <View style={styles.rewardRow}>

              <View style={styles.rewardCard}>

                <AppIcon name="coins" size={24} color="#F59E0B" style={styles.rewardIcon} />

                <AppText style={styles.rewardValue}>
                  +{lastSleepSession.coins}
                </AppText>

                <AppText style={styles.rewardLabel}>
                  {t.coins}
                </AppText>

              </View>

              <View style={styles.rewardCard}>

                <AppIcon name="level" size={24} color={NIGHT.yellow} style={styles.rewardIcon} />

                <AppText style={styles.rewardValue}>
                  +{lastSleepSession.earnedXP}
                </AppText>

                <AppText style={styles.rewardLabel}>
                  XP
                </AppText>

              </View>

            </View>

            {/* Nivel subido */}

            {
              lastSleepSession.levelUp && (

                <View style={styles.levelUpCard}>

                  <AppIcon name="sparkles" size={22} color="#C77700" style={styles.levelUpIcon} />

                  <AppText style={styles.levelUpTitle}>
                    {t.levelUp}
                  </AppText>

                  <AppText style={styles.levelUpText}>
                    {t.congratulations}
                  </AppText>

                  <AppText style={styles.levelUpText}>
                    {t.youReachedLevel} {lastSleepSession.newLevel}
                  </AppText>

                </View>

              )
            }

            {/* Continuar */}

            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("Home")}
            >

              <AppText style={styles.buttonText}>
                {t.continue}
              </AppText>

            </TouchableOpacity>

          </Animated.View>

        </ScrollView>

      </SafeAreaView>

    </NightBackground>

  );

}

const styles = StyleSheet.create({

  safe: {
    flex: 1,
  },

  content: {
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 40,
  },

  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  empty: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 20,
    fontFamily: "Nunito_700Bold",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontFamily: "Nunito_800ExtraBold",
    textAlign: "center",
    marginBottom: 14,
  },

  petWrap: {
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 16,
  },

  petGlow: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(107,91,231,0.35)",
  },

  pet: {
    width: 170,
    height: 170,
    resizeMode: "contain",
  },

  metricCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(150,130,255,0.2)",
    borderRadius: 22,
    padding: 14,
    marginBottom: 14,
  },

  metricIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  metricLabel: {
    flex: 1,
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
  },

  metricValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Nunito_800ExtraBold",
  },

  rewardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 18,
    marginTop: 4,
  },

  rewardCard: {
    width: "48%",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(150,130,255,0.2)",
    borderRadius: 22,
    padding: 18,
  },

  rewardIcon: {
    marginBottom: 6,
  },

  rewardValue: {
    color: "#FFFFFF",
    fontSize: 26,
    fontFamily: "Nunito_800ExtraBold",
  },

  rewardLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
    marginTop: 4,
  },

  levelUpCard: {
    width: "100%",
    alignItems: "center",
    backgroundColor: "rgba(255,209,102,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,209,102,0.4)",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },

  levelUpIcon: {
    marginBottom: 6,
  },

  levelUpTitle: {
    color: "#FFD166",
    fontSize: 24,
    fontFamily: "Nunito_800ExtraBold",
    marginBottom: 4,
  },

  levelUpText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Nunito_600SemiBold",
    textAlign: "center",
    marginTop: 2,
  },

  button: {
    backgroundColor: NIGHT.end,
    paddingHorizontal: 56,
    paddingVertical: 17,
    borderRadius: 24,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    marginTop: 4,
  },

  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Nunito_800ExtraBold",
  },

});
