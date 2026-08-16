import React, {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppContext } from "../context/AppContext";
import PetCard from "../components/PetCard";
import {
  PETS,
  canBuyPet,
} from "../services/PetService";
import {
  getTranslations,
} from "../services/TranslationService";
import { NIGHT } from "../constants/theme";

import NightBackground from "../components/NightBackground";
import AppText from "../components/AppText";
import AppIcon from "../components/AppIcon";
import BottomNav from "../components/BottomNav";
import SwipeableTabScreen from "../components/SwipeableTabScreen";
import NamePetModal from "../components/NamePetModal";

export default function PetShopScreen({ navigation }) {

  const {

    language,

    coins,
    setCoins,

    ownedPets,
    setOwnedPets,

    selectedPet,
    setSelectedPet,

    petNames,
    setPetNames,

  } = useContext(AppContext);

  const t = getTranslations(language);

  const [namingPet, setNamingPet] = useState(null);

  const appear = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(appear, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [appear]);

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

    setNamingPet(pet);

  }

  function selectPet(id) {

    setSelectedPet(id);

  }

  function confirmPetName(name) {

    if (namingPet) {

      if (name) {
        setPetNames({
          ...petNames,
          [namingPet.id]: name,
        });
      }

      setNamingPet(null);

    }

  }

  const fadeOpacity = appear.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const fadeTranslate = appear.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  return (

    <SwipeableTabScreen active="PetShop" navigation={navigation}>

    <NightBackground moon={false}>

      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>

        <Animated.View
          style={[
            styles.wrap,
            {
              opacity: fadeOpacity,
              transform: [{ translateY: fadeTranslate }],
            },
          ]}
        >

          {/* Header */}

          <View style={styles.header}>

            <View style={styles.headerRow}>

              <View style={styles.headerIconBox}>
                <AppIcon name="paw" size={24} color={NIGHT.yellow} />
              </View>

              <View style={styles.headerText}>

                <AppText style={styles.title}>
                  {t.petShop}
                </AppText>

                <AppText style={styles.subtitle}>
                  {t.petShopSubtitle}
                </AppText>

              </View>

              <View style={styles.coinsCapsule}>

                <AppIcon name="coins" size={16} color={NIGHT.yellow} style={styles.coinsIcon} />

                <AppText style={styles.coinsValue}>
                  {coins}
                </AppText>

              </View>

            </View>

          </View>

          {/* Lista de mascotas */}

          <FlatList
            data={PETS}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
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

        </Animated.View>

        {/* Navegación inferior */}

        <View style={styles.bottomNav}>
          <BottomNav
            active="PetShop"
            navigation={navigation}
          />
        </View>

        {/* Nombrar mascota comprada */}

        <NamePetModal
          visible={!!namingPet}
          title={t.petPurchasedTitle}
          message={t.petPurchasedNameMessage}
          placeholder={t.petNamePlaceholder}
          cancelLabel={t.cancel}
          confirmLabel={t.ok}
          onConfirm={confirmPetName}
          onCancel={() => setNamingPet(null)}
        />

      </SafeAreaView>

    </NightBackground>

    </SwipeableTabScreen>

  );

}

const styles = StyleSheet.create({

  safe: {
    flex: 1,
  },

  wrap: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  header: {
    marginBottom: 18,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  headerText: {
    flex: 1,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontFamily: "Nunito_800ExtraBold",
  },

  subtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    marginTop: 2,
  },

  coinsCapsule: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,201,40,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,201,40,0.4)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  coinsIcon: {
    marginRight: 6,
  },

  coinsValue: {
    color: NIGHT.yellow,
    fontSize: 15,
    fontFamily: "Nunito_800ExtraBold",
  },

  list: {
    paddingBottom: 120,
  },

  bottomNav: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 22,
  },

});
