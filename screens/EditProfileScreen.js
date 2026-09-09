import React, {
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  TextInput,
  TouchableOpacity,
  ScrollView,
  View,
  Animated,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { AppContext } from "../context/AppContext";
import { NIGHT } from "../constants/theme";

import {
  getTranslations,
} from "../services/TranslationService";

import {
  calculateGoalHours,
  sanitizeAgeDigits,
  isValidAge,
} from "../utils/sleepUtils";

import NightBackground from "../components/NightBackground";
import AppText from "../components/AppText";
import AppIcon from "../components/AppIcon";
import styles from "./styles/EditProfileScreen.styles";

export default function EditProfileScreen({ navigation }) {

  const {

    userName,
    setUserName,

    petNames,
    setPetNames,

    selectedPet,

    userAge,
    setUserAge,

    goalHours,
    setGoalHours,

    language,

  } = useContext(AppContext);

  const t = getTranslations(language);

  const appear = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(appear, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [appear]);

  const [name, setName] = useState(userName);

  const [petNameInput, setPetNameInput] = useState(
    petNames?.[selectedPet] || ""
  );

  const [age, setAge] = useState(
    userAge ? String(userAge) : ""
  );

  const [goal, setGoal] = useState(
    String(goalHours)
  );

  const ageNumber = age ? Number(age) : null;

  const recommendedHours =
    ageNumber ? calculateGoalHours(ageNumber) : null;

  function saveProfile() {

    if (age !== "" && !isValidAge(age)) {
      Alert.alert(t.ageInvalid);
      return;
    }

    setUserName(name);

    setPetNames((prev) => ({
      ...prev,
      [selectedPet]: petNameInput,
    }));

    setUserAge(age === "" ? null : Math.min(99, Math.max(1, Number(sanitizeAgeDigits(age)))));

    setGoalHours(Number(goal));

    navigation.goBack();

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

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >

          <Animated.View
            style={{
              opacity: fadeOpacity,
              transform: [{ translateY: fadeTranslate }],
            }}
          >

            {/* Header */}

            <View style={styles.headerRow}>

              <TouchableOpacity
                style={styles.circleButton}
                onPress={() => navigation.goBack()}
              >
                <AppIcon name="back" size={20} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.headerCenter}>

                <AppText style={styles.title}>
                  {t.editProfile}
                </AppText>

                <AppText style={styles.subtitle}>
                  {t.editSubtitle}
                </AppText>

              </View>

              <View style={styles.circleButton}>
                <AppIcon name="pencil" size={20} color={NIGHT.yellow} />
              </View>

            </View>

            {/* Introducción */}

            <View style={styles.introCard}>

              <View style={styles.introIcon}>
                <AppIcon name="sparkles" size={20} color={NIGHT.yellow} />
              </View>

              <View style={styles.introText}>

                <AppText style={styles.introTitle}>
                  {t.editSubtitle}
                </AppText>

                <AppText style={styles.introDesc}>
                  {t.editIntro}
                </AppText>

              </View>

            </View>

            {/* Nombre */}

            <View style={styles.glassCard}>

              <View style={styles.fieldHeader}>

                <View style={styles.fieldIcon}>
                  <AppIcon name="person" size={18} color="#8FA3FF" />
                </View>

                <AppText style={styles.fieldLabel}>
                  {t.name}
                </AppText>

              </View>

              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={t.yourName}
                placeholderTextColor="#B8B2E8"
                cursorColor={NIGHT.end}
                style={styles.input}
              />

            </View>

            {/* Edad */}

            <View style={styles.glassCard}>

              <View style={styles.fieldHeader}>

                <View style={styles.fieldIcon}>
                  <AppIcon name="cake" size={18} color={NIGHT.pink} />
                </View>

                <AppText style={styles.fieldLabel}>
                  {t.age}
                </AppText>

              </View>

              <TextInput
                value={age}
                onChangeText={(v) => setAge(sanitizeAgeDigits(v))}
                placeholder={t.age}
                placeholderTextColor="#B8B2E8"
                cursorColor={NIGHT.end}
                keyboardType="numeric"
                maxLength={2}
                style={styles.input}
              />

              {age !== "" && !isValidAge(age) && (
                <AppText style={styles.fieldDesc}>
                  {t.ageInvalid}
                </AppText>
              )}

            </View>

            {/* Pet name */}

            <View style={styles.glassCard}>

              <View style={styles.fieldHeader}>

                <View style={styles.fieldIcon}>
                  <AppIcon name="paw" size={18} color={NIGHT.yellow} />
                </View>

                <AppText style={styles.fieldLabel}>
                  {t.petName}
                </AppText>

              </View>

              <TextInput
                value={petNameInput}
                onChangeText={setPetNameInput}
                placeholder={t.petNamePlaceholder}
                placeholderTextColor="#B8B2E8"
                cursorColor={NIGHT.end}
                style={styles.input}
              />

            </View>

            {/* Meta de sueño */}

            <View style={styles.glassCard}>

              <View style={styles.fieldHeader}>

                <View style={styles.fieldIcon}>
                  <AppIcon name="night" size={18} color={NIGHT.yellow} />
                </View>

                <AppText style={styles.fieldLabel}>
                  {t.sleepGoal}
                </AppText>

              </View>

              <AppText style={styles.fieldDesc}>
                {t.goalQuestion}
              </AppText>

              <View style={styles.goalRow}>

                <TextInput
                  value={goal}
                  onChangeText={setGoal}
                  keyboardType="numeric"
                  placeholderTextColor="#B8B2E8"
                  cursorColor={NIGHT.end}
                  style={[styles.input, styles.goalInput]}
                />

                <AppText style={styles.goalUnit}>
                  {t.hoursPerNight}
                </AppText>

              </View>

              {
                recommendedHours &&
                recommendedHours !== Number(goal) && (
                  <TouchableOpacity
                    style={styles.recommended}
                    onPress={() =>
                      setGoal(String(recommendedHours))
                    }
                  >

                    <AppIcon
                      name="sparkles"
                      size={14}
                      color={NIGHT.yellow}
                      style={styles.recommendedIcon}
                    />

                    <AppText style={styles.recommendedText}>
                      {t.recommendedHours.replace(
                        "{{hours}}",
                        recommendedHours
                      )}
                    </AppText>

                  </TouchableOpacity>
                )
              }

            </View>

            {/* Tu objetivo */}

            <LinearGradient
              colors={[NIGHT.end, "#4A3F8F"]}
              style={styles.goalCard}
            >

              <View style={styles.goalDecorRow}>

                <AppIcon name="night" size={20} color={NIGHT.yellow} style={styles.goalDecorIcon} />

                <AppIcon name="sparkles" size={14} color={NIGHT.yellow} />

              </View>

              <AppText style={styles.goalCardTitle}>
                {t.yourGoal}
              </AppText>

              <AppText style={styles.goalCardValue}>
                {goal || "0"} {t.hoursOfSleep}
              </AppText>

              <AppText style={styles.goalCardMessage}>
                {t.goalMotivation}
              </AppText>

            </LinearGradient>

            {/* Guardar */}

            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveProfile}
            >

              <AppIcon name="save" size={20} color="#FFFFFF" style={styles.saveIcon} />

              <AppText style={styles.saveText}>
                {t.saveChanges}
              </AppText>

            </TouchableOpacity>

            {/* Cancelar */}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >

              <AppText style={styles.cancelText}>
                {t.cancel}
              </AppText>

            </TouchableOpacity>

          </Animated.View>

        </ScrollView>

      </SafeAreaView>

    </NightBackground>

  );

}

