import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";

import { AppContext } from "../context/AppContext";
import PetCard from "../components/PetCard";
import {
  PETS,
  canBuyPet,
} from "../services/PetService";
import {
  getTranslations,
} from "../services/TranslationService";
import { COLORS, FONT } from "../constants/theme";

export default function PetShopScreen() {

  const {

    language,

    coins,
    setCoins,

    ownedPets,
    setOwnedPets,

    selectedPet,
    setSelectedPet,

  } = useContext(AppContext);

  const t = getTranslations(language);

  function buyPet(pet) {

    if (!canBuyPet(pet, coins)) {

      Alert.alert(
        t.notEnoughCoins,
        t.notEnoughCoinsDescription
      );

      return;

    }

    setCoins(coins - pet.price);

    setOwnedPets([
      ...ownedPets,
      pet.id,
    ]);

    Alert.alert(
      t.petPurchased,
      `${pet.name} ${t.petPurchasedDescription}`
    );

  }

  function selectPet(id) {

    setSelectedPet(id);

  }

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        🐾 {t.petShop}
      </Text>

      <Text style={styles.coins}>
        💰 {coins} {t.coins}
      </Text>

      <FlatList
        data={PETS}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (

          <PetCard

            pet={item}

            owned={ownedPets.includes(item.id)}

            selected={selectedPet === item.id}

            onBuy={() => buyPet(item)}

            onSelect={() => selectPet(item.id)}

          />

        )}
      />

    </View>

  );

}

const styles = StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor: COLORS.background,

    paddingTop: 55,

    paddingHorizontal: 20,

  },

  title: {

    fontSize: FONT.title,

    fontWeight: "bold",

    marginBottom: 8,

    color: COLORS.text,

  },

  coins: {

    fontSize: 18,

    marginBottom: 20,

    color: COLORS.primary,

    fontWeight: "bold",

  },

});