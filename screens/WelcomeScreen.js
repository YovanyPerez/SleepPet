import React, { useContext } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppContext } from "../context/AppContext";
import { getTranslations } from "../services/TranslationService";
import { NIGHT } from "../constants/theme";

import NightBackground from "../components/NightBackground";
import AppText from "../components/AppText";
import AppIcon from "../components/AppIcon";
import GlowMoon from "../components/GlowMoon";

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

const styles = StyleSheet.create({

  safe: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontFamily: "Nunito_800ExtraBold",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 12,
  },

  subtitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 17,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 36,
  },

  languageContainer: {
    flexDirection: "row",
    marginBottom: 40,
  },

  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 999,
    marginHorizontal: 8,
  },

  selectedButton: {
    backgroundColor: NIGHT.end,
    borderColor: NIGHT.end,
  },

  languageText: {
    color: "rgba(255,255,255,0.8)",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
  },

  languageTextActive: {
    color: "#FFFFFF",
  },

  languageCheck: {
    marginLeft: 6,
  },

  button: {
    backgroundColor: NIGHT.end,
    paddingHorizontal: 48,
    paddingVertical: 17,
    borderRadius: 26,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },

  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Nunito_800ExtraBold",
  },

});
