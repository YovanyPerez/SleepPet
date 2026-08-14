import React, { useContext } from "react";
import {
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
import { COLORS } from "../constants/theme";

import ScreenContainer from "../components/ScreenContainer";
import AppText from "../components/AppText";

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
        t.notEnoughCoinsMessage
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
      t.petPurchasedMessage.replace(
        "{{pet}}",
        t[pet.nameKey]
      )
    );

  }

  function selectPet(id) {

    setSelectedPet(id);

  }

  return (

    <ScreenContainer style={styles.container}>

      <AppText
        variant="title"
        style={styles.title}
      >
        🐾 {t.petShop}
      </AppText>

      <AppText style={styles.coins}>
        💰 {coins} {t.coins}
      </AppText>

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

    </ScreenContainer>

  );

}

const styles = StyleSheet.create({

  container: {

    paddingTop: 55,

    paddingHorizontal: 20,

  },

  title: {

    marginBottom: 8,

  },

  coins: {

    marginBottom: 20,

    color: COLORS.primary,

    fontWeight: "bold",

  },

});
