import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { AppContext } from "../context/AppContext";
import { getTranslations } from "../services/TranslationService";
import { COLORS } from "../constants/theme";

import ScreenContainer from "../components/ScreenContainer";
import AppText from "../components/AppText";

export default function WelcomeScreen({ navigation }) {

  const {
    language,
    setLanguage,
  } = useContext(AppContext);

  const t = getTranslations(language);

  return (

    <ScreenContainer style={styles.container}>

      <Text style={styles.logo}>
        🐱
      </Text>

      <AppText
        variant="title"
        center
        style={styles.title}
      >
        {t.welcomeTitle}
      </AppText>

      <AppText
        color={COLORS.textSecondary}
        style={styles.subtitle}
      >
        {t.welcomeSubtitle}
      </AppText>

      <View style={styles.languageContainer}>

        <TouchableOpacity
          style={[
            styles.languageButton,
            language === "en" && styles.selectedButton,
          ]}
          onPress={() => setLanguage("en")}
        >

          <AppText style={styles.languageText}>
            🇺🇸 English
          </AppText>

        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.languageButton,
            language === "es" && styles.selectedButton,
          ]}
          onPress={() => setLanguage("es")}
        >

          <AppText style={styles.languageText}>
            🇪🇸 Español
          </AppText>

        </TouchableOpacity>

      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("CreateProfile")}
      >

        <AppText style={styles.buttonText}>
          {t.getStarted}
        </AppText>

      </TouchableOpacity>

    </ScreenContainer>

  );

}

const styles = StyleSheet.create({

  container: {
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  logo: {
    fontSize: 90,
    marginBottom: 25,
  },

  title: {
    marginBottom: 15,
  },

  subtitle: {
    fontSize: 18,
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 35,
  },

  languageContainer: {
    flexDirection: "row",
    marginBottom: 40,
  },

  languageButton: {
    backgroundColor: "#EAEAEA",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    marginHorizontal: 8,
  },

  selectedButton: {
    backgroundColor: COLORS.primary,
  },

  languageText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 45,
    paddingVertical: 16,
    borderRadius: 20,
    elevation: 5,
  },

  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

});
