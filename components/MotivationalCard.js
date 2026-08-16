import React, { useContext } from "react";
import { View, StyleSheet, Image } from "react-native";

import { AppContext } from "../context/AppContext";
import { PET_IMAGES } from "../constants/PetImages";
import AppText from "./AppText";
import { COLORS } from "../constants/theme";

export default function MotivationalCard({ t }) {

  const {
    selectedPet,
    petMood,
  } = useContext(AppContext);

  return (
    <View style={styles.card}>

      <Image
        source={PET_IMAGES[selectedPet][petMood]}
        style={styles.pet}
      />

      <View style={styles.text}>

        <AppText style={styles.title}>
          {t.keepGoing}
        </AppText>

        <AppText style={styles.message}>
          {t.keepGoingMessage}
        </AppText>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EDEBFF",
    borderRadius: 26,
    padding: 18,
    marginBottom: 18,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  pet: {
    width: 90,
    height: 90,
    resizeMode: "contain",
    marginRight: 14,
  },

  text: {
    flex: 1,
  },

  title: {
    fontSize: 20,
    fontFamily: "Nunito_800ExtraBold",
    color: COLORS.text,
  },

  message: {
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
