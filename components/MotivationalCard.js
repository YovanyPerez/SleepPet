import React, { useContext } from "react";
import { View, StyleSheet, Image } from "react-native";

import { AppContext } from "../context/AppContext";
import { PET_IMAGES } from "../constants/PetImages";
import AppText from "./AppText";

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
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 26,
    padding: 18,
    marginBottom: 18,
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
    color: "#FFFFFF",
  },

  message: {
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
  },
});
