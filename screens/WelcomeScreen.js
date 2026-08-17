import React, { useContext } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppContext } from "../context/AppContext";
import { getTranslations } from "../services/TranslationService";

import NightBackground from "../components/NightBackground";
import AppText from "../components/AppText";
import AppIcon from "../components/AppIcon";
import GlowMoon from "../components/GlowMoon";
import styles from "./styles/WelcomeScreen.styles";

function LanguagePill({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.languageButton, active && styles.selectedButton]}
      onPress={onPress}
    >
      <AppText style={[styles.languageText, active && styles.languageTextActive]}>
        {label}
      </AppText>
      {active && (
        <AppIcon name="check" size={14} color="#FFFFFF" style={styles.languageCheck} />
      )}
    </TouchableOpacity>
  );
}

export default function WelcomeScreen({ navigation }) {

  const {
    language,
    setLanguage,
  } = useContext(AppContext);

  const t = getTranslations(language);

  return (

    <NightBackground moon={false}>

      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >

          <GlowMoon size={110} />

          <AppText style={styles.title}>
            {t.welcomeTitle}
          </AppText>

          <AppText style={styles.subtitle}>
            {t.welcomeSubtitle}
          </AppText>

          <View style={styles.languageContainer}>

            <LanguagePill
              label="English"
              active={language === "en"}
              onPress={() => setLanguage("en")}
            />

            <LanguagePill
              label="Español"
              active={language === "es"}
              onPress={() => setLanguage("es")}
            />

          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("CreateProfile")}
          >

            <AppText style={styles.buttonText}>
              {t.getStarted}
            </AppText>

          </TouchableOpacity>

        </ScrollView>

      </SafeAreaView>

    </NightBackground>

  );

}

