import React, {
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  View,
  Animated,
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
} from "../utils/sleepUtils";

import NightBackground from "../components/NightBackground";
import AppText from "../components/AppText";
import AppIcon from "../components/AppIcon";

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

    setUserName(name);

    setPetNames((prev) => ({
      ...prev,
      [selectedPet]: petNameInput,
    }));

    setUserAge(Number(age));

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
                onChangeText={setAge}
                placeholder={t.age}
                placeholderTextColor="#B8B2E8"
                cursorColor={NIGHT.end}
                keyboardType="numeric"
                style={styles.input}
              />

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

const styles = StyleSheet.create({

  safe: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontFamily: "Nunito_800ExtraBold",
  },

  subtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    marginTop: 2,
  },

  introCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(150,130,255,0.25)",
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
  },

  introIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  introText: {
    flex: 1,
  },

  introTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "Nunito_800ExtraBold",
  },

  introDesc: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    marginTop: 3,
  },

  glassCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(150,130,255,0.20)",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
  },

  fieldHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  fieldIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  fieldLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
  },

  fieldDesc: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    marginBottom: 12,
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(150,130,255,0.35)",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 18,
    color: "#FFFFFF",
  },

  goalRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  goalInput: {
    flex: 1,
  },

  goalUnit: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 15,
    fontFamily: "Nunito_600SemiBold",
    marginLeft: 12,
  },

  recommended: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 15,
  },

  recommendedIcon: {
    marginRight: 6,
  },

  recommendedText: {
    color: "#C9C4E8",
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
  },

  goalCard: {
    alignItems: "center",
    borderRadius: 26,
    padding: 22,
    marginBottom: 20,
    marginTop: 4,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },

  goalDecorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  goalDecorIcon: {
    marginRight: 6,
  },

  goalCardTitle: {
    color: NIGHT.yellow,
    fontSize: 16,
    fontFamily: "Nunito_800ExtraBold",
    letterSpacing: 1,
  },

  goalCardValue: {
    color: "#FFFFFF",
    fontSize: 26,
    fontFamily: "Nunito_800ExtraBold",
    marginTop: 6,
  },

  goalCardMessage: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    marginTop: 6,
  },

  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: NIGHT.end,
    borderRadius: 24,
    height: 60,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },

  saveIcon: {
    marginRight: 8,
  },

  saveText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Nunito_800ExtraBold",
  },

  cancelButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1.5,
    borderColor: "rgba(150,130,255,0.4)",
    borderRadius: 26,
    height: 56,
    marginTop: 14,
  },

  cancelText: {
    color: "#D5CFF5",
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
  },

});
