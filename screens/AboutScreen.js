import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { AppContext } from "../context/AppContext";
import { getTranslations } from "../services/TranslationService";
import { COLORS, FONT } from "../constants/theme";

export default function AboutScreen({ navigation }) {

  const { language } = useContext(AppContext);

  const t = getTranslations(language);

  return (

    <View style={styles.container}>

      <Text style={styles.logo}>
        🐱
      </Text>

      <Text style={styles.title}>
        SleepPet
      </Text>

      <View style={styles.card}>

        <Text style={styles.label}>
          {t.madeBy}
        </Text>

        <Text style={styles.value}>
          Yovany Perez
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.label}>
          {t.version}
        </Text>

        <Text style={styles.value}>
          v1.0
        </Text>

      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.goBack()}
      >

        <Text style={styles.buttonText}>
          ← {t.back}
        </Text>

      </TouchableOpacity>

    </View>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },

  logo: {
    fontSize: 90,
    marginBottom: 20,
  },

  title: {
    fontSize: FONT.title,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 35,
  },

  card: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    elevation: 4,
  },

  label: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },

  value: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
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
    fontSize: 18,
  },

});