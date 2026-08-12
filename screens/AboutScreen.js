import React, { useContext } from "react";
import {
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { AppContext } from "../context/AppContext";
import { getTranslations } from "../services/TranslationService";
import { COLORS } from "../constants/theme";

import ScreenContainer from "../components/ScreenContainer";
import Card from "../components/Card";
import AppText from "../components/AppText";

export default function AboutScreen({ navigation }) {

  const { language } = useContext(AppContext);

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
        SleepPet
      </AppText>

      <Card style={styles.card}>

        <AppText
          variant="body"
          color={COLORS.textSecondary}
          style={styles.label}
        >
          {t.madeBy}
        </AppText>

        <AppText variant="subtitle">
          Yovany Perez
        </AppText>

      </Card>

      <Card style={styles.card}>

        <AppText
          variant="body"
          color={COLORS.textSecondary}
          style={styles.label}
        >
          {t.version}
        </AppText>

        <AppText variant="subtitle">
          v1.0
        </AppText>

      </Card>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.goBack()}
      >

        <AppText style={styles.buttonText}>
          ← {t.back}
        </AppText>

      </TouchableOpacity>

    </ScreenContainer>

  );

}

const styles = StyleSheet.create({

  container: {
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },

  logo: {
    fontSize: 90,
    marginBottom: 20,
  },

  title: {
    marginBottom: 35,
  },

  card: {
    width: "100%",
    alignItems: "center",
  },

  label: {
    marginBottom: 8,
  },

  button: {
    marginTop: 25,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 18,
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
  },

});
