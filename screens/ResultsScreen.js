import React, {
  useContext,
  useEffect,
  useRef,
} from "react";
import {
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ReanimatedAnimated, {
  Easing,
  FadeIn,
  Keyframe,
  useReducedMotion,
} from "react-native-reanimated";

import { AppContext } from "../context/AppContext";
import { NIGHT } from "../constants/theme";
import { PET_IMAGES } from "../constants/PetImages";
import {
  getTranslations,
} from "../services/TranslationService";

import NightBackground from "../components/NightBackground";
import AppText from "../components/AppText";
import AppIcon from "../components/AppIcon";
import styles from "./styles/ResultsScreen.styles";

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

export default function ResultsScreen({ navigation }) {

  const {

    lastSleepSession,

    selectedPet,

    language,

  } = useContext(AppContext);

  const t = getTranslations(language);

  const reducedMotion = useReducedMotion();

  // Entrada escalonada de las tarjetas (opacity + 8px). Cap de 4 pasos (160ms).
  const cardEnter = (index) => {
    if (reducedMotion) return FadeIn.duration(150);
    return new Keyframe({
      from: { opacity: 0, transform: [{ translateY: 8 }] },
      to: { opacity: 1, transform: [{ translateY: 0 }], easing: EASE_OUT },
    })
      .duration(220)
      .delay(Math.min(index, 4) * 40);
  };

  const appear = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(appear, {
      toValue: 1,
      duration: 250,
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

  // La calidad es un enum interno en inglés ("Poor"/"Good"/...);
  // aquí se traduce solo para display
  function qualityText() {

    switch (lastSleepSession.quality) {

      case "Excellent":
        return t.qualityExcellent;

      case "Good":
        return t.qualityGood;

      case "Average":
        return t.qualityAverage;

      default:
        return t.qualityPoor;

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

            {/* Siesta: registro sin recompensas */}

            {lastSleepSession.isNap && (
              <View style={styles.napTag}>
                <AppText style={styles.napTagText}>
                  {t.resultsNapTag}
                </AppText>
              </View>
            )}

            {/* Métricas */}

            <ReanimatedAnimated.View entering={cardEnter(0)} style={styles.metricCard}>

              <View style={styles.metricIcon}>
                <AppIcon name="night" size={20} color={NIGHT.yellow} />
              </View>

              <AppText style={styles.metricLabel}>
                {t.sleepTime}
              </AppText>

              <AppText style={styles.metricValue}>
                {lastSleepSession.hours} {t.hours}
              </AppText>

            </ReanimatedAnimated.View>

            <ReanimatedAnimated.View entering={cardEnter(1)} style={styles.metricCard}>

              <View style={styles.metricIcon}>
                <AppIcon name="sleep" size={20} color="#8FA3FF" />
              </View>

              <AppText style={styles.metricLabel}>
                {t.sleepQuality}
              </AppText>

              <AppText style={styles.metricValue}>
                {qualityText()}
              </AppText>

            </ReanimatedAnimated.View>

            <ReanimatedAnimated.View entering={cardEnter(2)} style={styles.metricCard}>

              <View style={styles.metricIcon}>
                <AppIcon name="score" size={20} color="#C9B8E8" />
              </View>

              <AppText style={styles.metricLabel}>
                {t.sleepScore}
              </AppText>

              <AppText style={styles.metricValue}>
                {lastSleepSession.score}/100
              </AppText>

            </ReanimatedAnimated.View>

            <ReanimatedAnimated.View entering={cardEnter(3)} style={styles.metricCard}>

              <View style={styles.metricIcon}>
                <AppIcon name="unlocks" size={20} color="#8FA3FF" />
              </View>

              <AppText style={styles.metricLabel}>
                {t.phoneUnlocks}
              </AppText>

              <AppText style={styles.metricValue}>
                {lastSleepSession.unlockCount}
              </AppText>

            </ReanimatedAnimated.View>

            {/* Movimiento nocturno legacy oculto (Fase D): lo reemplaza Sueño estimado* con WAKE/LIGHT/DEEP */}

            <ReanimatedAnimated.View entering={cardEnter(4)} style={styles.metricCard}>

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

            </ReanimatedAnimated.View>

            <ReanimatedAnimated.View entering={cardEnter(5)} style={styles.metricCard}>

              <View style={styles.metricIcon}>
                <AppIcon name="heartPulse" size={20} color="#FF8FAB" />
              </View>

              <AppText style={styles.metricLabel}>
                {t.ppgBpm}
              </AppText>

              <AppText style={styles.metricValue}>
                {lastSleepSession.preSleepBpm ? `${lastSleepSession.preSleepBpm} ${t.ppgBpmUnit}` : t.ppgNoBpm}
              </AppText>

            </ReanimatedAnimated.View>

            {lastSleepSession.estimatedStages && (
              <ReanimatedAnimated.View entering={cardEnter(6)} style={styles.metricCard}>
                <View style={styles.metricIcon}>
                  <AppIcon name="night" size={20} color="#8FA3FF" />
                </View>
                <View style={styles.metricStack}>
                  <AppText style={styles.metricStackLabel}>
                    {(t.smartSleepHipnogram ?? "Sueño estimado*")}
                  </AppText>
                  <AppText style={styles.metricStackValue}>
                    {`${lastSleepSession.estimatedStages.deep ?? 0}m ${t.smartSleepDeep ?? "prof."} · ${lastSleepSession.estimatedStages.light ?? 0}m ${t.smartSleepLight ?? "lig."} · ${lastSleepSession.estimatedStages.wake ?? 0}m ${t.smartSleepWake ?? "desp."}`}
                  </AppText>
                </View>
              </ReanimatedAnimated.View>
            )}
            {lastSleepSession.estimatedStages && (
              <AppText style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, textAlign: "center", marginTop: -8, marginBottom: 8 }}>
                {t.smartSleepDisclaimerSmall ?? "*Estimación por reglas movimiento+audio, no diagnóstico médico"}
              </AppText>
            )}

            {/* Recompensas */}

            <ReanimatedAnimated.View entering={cardEnter(7)} style={styles.rewardRow}>

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

            </ReanimatedAnimated.View>

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
              onPress={() => navigation.navigate("Tabs", { screen: "Home" })}
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

