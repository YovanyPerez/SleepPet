import React, {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  View,
  FlatList,
  Alert,
  Animated,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppContext } from "../context/AppContext";
import PetCard from "../components/PetCard";
import {
  PETS,
  canBuyPet,
} from "../services/PetService";
import {
  CONSUMABLES,
  SHIELD_PRICE,
  RENAME_PRICE,
  applyConsumable,
} from "../services/ShopService";
import {
  getTranslations,
} from "../services/TranslationService";
import { NIGHT } from "../constants/theme";

import NightBackground from "../components/NightBackground";
import AppText from "../components/AppText";
import AppIcon from "../components/AppIcon";
import NamePetModal from "../components/NamePetModal";
import styles from "./styles/PetShopScreen.styles";

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

    petHappiness,
    setPetHappiness,
    setLastHappinessUpdate,

    streakShields,
    setStreakShields,

    level,

  } = useContext(AppContext);

  const t = getTranslations(language);

  const [namingPet, setNamingPet] = useState(null);
  const [renaming, setRenaming] = useState(false);

  const appear = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(appear, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [appear]);

  function buyPet(pet) {

    if (!canBuyPet(pet, coins, level)) {

      if (level < (pet.minLevel ?? 1)) {

        Alert.alert(
          t.shopLevelRequired.replace(
            "{{level}}",
            pet.minLevel ?? 1
          )
        );

        return;

      }

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

  function buyConsumable(item) {

    if (coins < item.price) {

      Alert.alert(
        t.notEnoughCoins,
        t.notEnoughCoinsShopMessage
      );

      return;

    }

    setCoins(coins - item.price);

    setPetHappiness(
      applyConsumable(petHappiness, item.happiness)
    );

    setLastHappinessUpdate(Date.now());

  }

  function buyShield() {

    if (coins < SHIELD_PRICE) {

      Alert.alert(
        t.notEnoughCoins,
        t.notEnoughCoinsShopMessage
      );

      return;

    }

    setCoins(coins - SHIELD_PRICE);

    setStreakShields(streakShields + 1);

  }

  function openRename() {

    if (coins < RENAME_PRICE) {

      Alert.alert(
        t.notEnoughCoins,
        t.notEnoughCoinsShopMessage
      );

      return;

    }

    setRenaming(true);

  }

  function confirmRename(name) {

    if (name) {

      setCoins(coins - RENAME_PRICE);

      setPetNames({
        ...petNames,
        [selectedPet]: name,
      });

    }

    setRenaming(false);

  }

  function renderShopRow({
    icon,
    title,
    desc,
    extra,
    price,
    onPress,
  }) {

    return (

      <View style={styles.shopRow}>

        <View style={styles.shopIconBox}>
          <AppIcon name={icon} size={22} color={NIGHT.yellow} />
        </View>

        <View style={styles.shopInfo}>

          <AppText style={styles.shopName}>
            {title}
          </AppText>

          <AppText style={styles.shopDesc}>
            {desc}
          </AppText>

          {extra ? (
            <AppText style={styles.shopExtra}>
              {extra}
            </AppText>
          ) : null}

        </View>

        <TouchableOpacity
          style={styles.shopBuy}
          onPress={onPress}
        >

          <AppIcon name="coins" size={13} color={NIGHT.yellow} style={styles.shopBuyIcon} />

          <AppText style={styles.shopBuyText}>
            {price}
          </AppText>

        </TouchableOpacity>

      </View>

    );

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
            ListHeaderComponent={

              <View>

                <AppText style={styles.sectionTitle}>
                  {t.shopTreats}
                </AppText>

                {CONSUMABLES.map((item) =>
                  renderShopRow({
                    icon: item.icon,
                    title: t[item.nameKey],
                    desc: t[item.descKey],
                    price: item.price,
                    onPress: () => buyConsumable(item),
                  })
                )}

                <AppText style={styles.sectionTitle}>
                  {t.shopShield}
                </AppText>

                {renderShopRow({
                  icon: "shield",
                  title: t.shopShield,
                  desc: t.shopShieldDesc,
                  extra: `${t.shopShieldOwned}: ${streakShields}`,
                  price: SHIELD_PRICE,
                  onPress: buyShield,
                })}

                {renderShopRow({
                  icon: "pencil",
                  title: t.shopRename,
                  desc: t.shopRenameDesc,
                  price: RENAME_PRICE,
                  onPress: openRename,
                })}

                <AppText style={styles.sectionTitle}>
                  {t.shopPets}
                </AppText>

              </View>

            }
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

        {/* Renombrar mascota seleccionada (costo en monedas) */}

        <NamePetModal
          visible={renaming}
          title={t.shopRename}
          message={t.shopRenameDesc}
          placeholder={petNames[selectedPet] || t.petNamePlaceholder}
          cancelLabel={t.cancel}
          confirmLabel={t.ok}
          onConfirm={confirmRename}
          onCancel={() => setRenaming(false)}
        />

      </SafeAreaView>

    </NightBackground>

  );

}

