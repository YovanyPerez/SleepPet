import React, { useContext } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";

import { NIGHT } from "../constants/theme";
import { PET_IMAGES } from "../constants/PetImages";
import { AppContext } from "../context/AppContext";
import { getTranslations } from "../services/TranslationService";

import AppText from "./AppText";
import AppIcon from "./AppIcon";

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

  function renderAction() {

    if (!pet.available) {

      return (
        <View style={[styles.actionButton, styles.disabledButton]}>
          <AppText style={styles.disabledText}>
            {t.comingSoon}
          </AppText>
        </View>
      );

    }

    if (selected) {

      return (
        <View style={[styles.actionButton, styles.selectedButton]}>

          <AppIcon name="check" size={14} color="#FFFFFF" style={styles.actionIcon} />

          <AppText style={styles.actionText}>
            {t.selected}
          </AppText>

        </View>
      );

    }

    if (owned) {

      return (
        <TouchableOpacity
          style={[styles.actionButton, styles.selectButton]}
          onPress={onSelect}
        >
          <AppText style={styles.actionText}>
            {t.select}
          </AppText>
        </TouchableOpacity>
      );

    }

    return (
      <TouchableOpacity
        style={[styles.actionButton, styles.buyButton]}
        onPress={onBuy}
      >

        <AppIcon name="coins" size={14} color={NIGHT.yellow} style={styles.actionIcon} />

        <AppText style={styles.actionText}>
          {t.buy}
        </AppText>

      </TouchableOpacity>
    );

  }

  function renderPrice() {

    if (!pet.available) {

      return (
        <AppText style={styles.priceText}>
          {t.comingSoon}
        </AppText>
      );

    }

    if (pet.price === 0) {

      return (
        <AppText style={styles.priceText}>
          {t.free}
        </AppText>
      );

    }

    return (
      <View style={styles.priceRow}>

        <AppIcon name="coins" size={14} color={NIGHT.yellow} style={styles.priceIcon} />

        <AppText style={styles.priceText}>
          {pet.price}
        </AppText>

        <AppText style={styles.priceUnit}>
          {t.coins}
        </AppText>

      </View>
    );

  }

  return (

    <View style={[styles.card, selected && styles.cardSelected]}>

      <Image
        source={pet.available ? PET_IMAGES[pet.id].happy : COMING_SOON}
        style={styles.petImage}
      />

      <View style={styles.info}>

        <AppText style={styles.name}>
          {t[pet.nameKey]}
        </AppText>

        <View style={styles.priceArea}>
          {renderPrice()}
        </View>

        {renderAction()}

      </View>

    </View>

  );

}

const styles = StyleSheet.create({

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(150,130,255,0.25)",
    borderRadius: 26,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },

  cardSelected: {
    borderColor: "#FFC928",
    shadowColor: "#FFC928",
    shadowOpacity: 0.25,
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  petImage: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginRight: 14,
  },

  info: {
    flex: 1,
  },

  name: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Nunito_800ExtraBold",
  },

  priceArea: {
    marginTop: 4,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  priceIcon: {
    marginRight: 4,
  },

  priceText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
  },

  priceUnit: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    marginLeft: 4,
  },

  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 12,
  },

  actionIcon: {
    marginRight: 6,
  },

  buyButton: {
    backgroundColor: NIGHT.end,
  },

  selectButton: {
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  selectedButton: {
    backgroundColor: "rgba(94,209,200,0.25)",
  },

  disabledButton: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  actionText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Nunito_800ExtraBold",
  },

  disabledText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
  },

});
