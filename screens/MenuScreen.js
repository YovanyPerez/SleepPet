import React, {
  useContext,
  useEffect,
  useRef,
} from "react";
import {
  View,
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
import styles from "./styles/MenuScreen.styles";

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

