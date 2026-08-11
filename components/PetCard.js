import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";

import { COLORS } from "../constants/theme";
import { PET_IMAGES } from "../constants/PetImages";
import { AppContext } from "../context/AppContext";
import { getTranslations } from "../services/TranslationService";

const COMING_SOON = require("../assets/pets/comingsoon.png");

export default function PetCard({

  pet,

  owned,

  selected,

  onBuy,

  onSelect,

}) {

  const { language } = useContext(AppContext);

  const t = getTranslations(language);

  function renderButton() {

    if (!pet.available) {

      return (

        <View style={styles.comingSoonButton}>

          <Text style={styles.buttonText}>
            {t.comingSoon}
          </Text>

        </View>

      );

    }

    if (selected) {

      return (

        <View style={styles.selectedButton}>

          <Text style={styles.selectedText}>
            {t.selected}
          </Text>

        </View>

      );

    }

    if (owned) {

      return (

        <TouchableOpacity
          style={styles.selectButton}
          onPress={onSelect}
        >

          <Text style={styles.buttonText}>
            {t.select}
          </Text>

        </TouchableOpacity>

      );

    }

    return (

      <TouchableOpacity
        style={styles.buyButton}
        onPress={onBuy}
      >

        <Text style={styles.buttonText}>
          {t.buy}
        </Text>

      </TouchableOpacity>

    );

  }

  return (

    <View style={styles.card}>

      {pet.available ? (

        <Image
          source={PET_IMAGES[pet.id].happy}
          style={styles.petImage}
        />

      ) : (

        <Image
          source={COMING_SOON}
          style={styles.petImage}
        />

      )}

      <Text style={styles.name}>
        {t[pet.nameKey]}
      </Text>

      <Text style={styles.price}>

        {!pet.available
          ? t.comingSoon
          : pet.price === 0
          ? t.free
          : `${pet.price} ${t.coins}`}

      </Text>

      {renderButton()}

    </View>

  );

}

const styles = StyleSheet.create({

  card: {

    backgroundColor: "white",

    borderRadius: 20,

    padding: 20,

    marginBottom: 18,

    alignItems: "center",

    elevation: 4,

  },

  petImage: {

    width: 130,

    height: 130,

    resizeMode: "contain",

    marginBottom: 10,

  },

  name: {

    fontSize: 24,

    fontWeight: "bold",

    marginTop: 5,

    color: COLORS.text,

  },

  price: {

    marginTop: 8,

    marginBottom: 18,

    color: COLORS.textSecondary,

    fontSize: 16,

  },

  buyButton: {

    backgroundColor: COLORS.primary,

    paddingHorizontal: 30,

    paddingVertical: 12,

    borderRadius: 16,

  },

  selectButton: {

    backgroundColor: "#5CB85C",

    paddingHorizontal: 30,

    paddingVertical: 12,

    borderRadius: 16,

  },

  selectedButton: {

    backgroundColor: "#999",

    paddingHorizontal: 30,

    paddingVertical: 12,

    borderRadius: 16,

  },

  comingSoonButton: {

    backgroundColor: "#BBBBBB",

    paddingHorizontal: 30,

    paddingVertical: 12,

    borderRadius: 16,

  },

  buttonText: {

    color: "white",

    fontWeight: "bold",

    fontSize: 16,

  },

  selectedText: {

    color: "white",

    fontWeight: "bold",

    fontSize: 16,

  },

});