import React, {
  useContext,
  useEffect,
  useRef,
} from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppContext } from "../context/AppContext";
import { getTranslations } from "../services/TranslationService";
import { NIGHT } from "../constants/theme";

import NightBackground from "../components/NightBackground";
import AppText from "../components/AppText";
import AppIcon from "../components/AppIcon";

function GlassMenuCard({ icon, iconColor, title, subtitle, onPress }) {

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
    >

      <View style={styles.cardIconCircle}>
        <AppIcon name={icon} size={24} color={iconColor} />
      </View>

      <View style={styles.cardText}>

        <AppText style={styles.cardTitle}>
          {title}
        </AppText>

        <AppText style={styles.cardSubtitle}>
          {subtitle}
        </AppText>

      </View>

      <View style={styles.arrowButton}>
        <AppIcon name="chevron" size={20} color="#FFFFFF" />
      </View>

    </TouchableOpacity>
  );
}

export default function MenuScreen({ navigation }) {

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

              <AppIcon
                name="sparkles"
                size={40}
                color={NIGHT.yellow}
                style={styles.headerIcon}
              />

              <AppText style={styles.title}>
                {t.menu}
              </AppText>

              <AppText style={styles.subtitle}>
                {t.chooseDestination}
              </AppText>

            </View>

            {/* Mi Perfil */}

            <GlassMenuCard
              icon="person"
              iconColor="#8FA3FF"
              title={t.myProfile}
              subtitle={t.viewProfile}
              onPress={() => navigation.navigate("Profile")}
            />

            {/* Historial de Sueño */}

            <GlassMenuCard
              icon="calendar"
              iconColor={NIGHT.yellow}
              title={t.sleepHistory}
              subtitle={t.viewSleepHistory}
              onPress={() => navigation.navigate("History")}
            />

            {/* Volver al Inicio */}

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >

              <AppIcon
                name="back"
                size={20}
                color="#FFFFFF"
                style={styles.backIcon}
              />

              <AppText style={styles.backText}>
                {t.backHome}
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
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 24,
  },

  header: {
    alignItems: "center",
    marginBottom: 40,
  },

  headerIcon: {
    marginBottom: 10,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 34,
    fontFamily: "Nunito_800ExtraBold",
  },

  subtitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 16,
    fontFamily: "Nunito_400Regular",
    marginTop: 6,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    borderRadius: 28,
    padding: 20,
    marginBottom: 18,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  cardIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  cardText: {
    flex: 1,
    marginRight: 8,
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontFamily: "Nunito_800ExtraBold",
  },

  cardSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    marginTop: 3,
  },

  arrowButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(107,91,231,0.5)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: NIGHT.end,
    borderRadius: 26,
    paddingVertical: 16,
    marginTop: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },

  backIcon: {
    marginRight: 8,
  },

  backText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "Nunito_800ExtraBold",
  },

});
