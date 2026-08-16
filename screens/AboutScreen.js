import React, { useContext, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
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
              1.0.2
            </AppText>

          </View>

        </Animated.View>

      </SafeAreaView>

    </NightBackground>

  );

}

const styles = StyleSheet.create({

  safe: {
    flex: 1,
  },

  wrap: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
  },

  headerRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontFamily: "Nunito_800ExtraBold",
  },

  glassCard: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(150,130,255,0.2)",
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    marginTop: 18,
  },

  label: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
    marginBottom: 6,
  },

  value: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "Nunito_800ExtraBold",
  },

});
