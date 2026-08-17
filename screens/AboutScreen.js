import React, { useContext, useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppContext } from "../context/AppContext";
import { getTranslations } from "../services/TranslationService";

import NightBackground from "../components/NightBackground";
import AppText from "../components/AppText";
import AppIcon from "../components/AppIcon";
import GlowMoon from "../components/GlowMoon";
import styles from "./styles/AboutScreen.styles";

import Constants from "expo-constants";

const APP_VERSION =
  Constants.expoConfig?.version ||
  Constants.nativeAppVersion ||
  "1.0.0";

export default function AboutScreen({ navigation }) {

  const { language } = useContext(AppContext);

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

  return (

    <NightBackground moon={false}>

      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>

        <Animated.View
          style={[
            styles.wrap,
            {
              opacity: fadeOpacity,
              transform: [{ translateY: fadeTranslate }],
            },
          ]}
        >

          {/* Header */}

          <View style={styles.headerRow}>

            <TouchableOpacity
              style={styles.circleButton}
              onPress={() => navigation.goBack()}
            >
              <AppIcon name="back" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <AppText style={styles.title}>
              SleepPet
            </AppText>

            <View style={styles.circleButton}>
              <AppIcon name="about" size={20} color="#C9B8E8" />
            </View>

          </View>

          <GlowMoon size={72} />

          {/* Cards de información */}

          <View style={styles.glassCard}>

            <AppText style={styles.label}>
              {t.madeBy}
            </AppText>

            <AppText style={styles.value}>
              Yovany Perez
            </AppText>

          </View>

          <View style={styles.glassCard}>

            <AppText style={styles.label}>
              {t.version}
            </AppText>

            <AppText style={styles.value}>
              {APP_VERSION}
            </AppText>

          </View>

        </Animated.View>

      </SafeAreaView>

    </NightBackground>

  );

}

