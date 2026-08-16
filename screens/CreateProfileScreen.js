import React, { useState, useContext } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppContext } from "../context/AppContext";
import { NIGHT } from "../constants/theme";
import { PET_IMAGES } from "../constants/PetImages";
import { getTranslations } from "../services/TranslationService";
import { calculateGoalHours } from "../utils/sleepUtils";

import NightBackground from "../components/NightBackground";
import AppText from "../components/AppText";
import AppIcon from "../components/AppIcon";

const GOAL_OPTIONS = [
  { key: "improve", icon: "night", labelKey: "goalImproveSleep" },
  { key: "habits", icon: "sparkles", labelKey: "goalHealthyHabits" },
  { key: "energy", icon: "flash", labelKey: "goalMoreEnergy" },
];

export default function CreateProfileScreen({ navigation }) {

  const {
    setUserName,
    setUserAge,
    setGoalHours,
    setGoalType,
    setPetNames,
    language,
  } = useContext(AppContext);

  const t = getTranslations(language);

  const [step, setStep] = useState(1);

  const [name, setName] = useState("");

  const [age, setAge] = useState("");

  const [goal, setGoal] = useState("");

  const [petNameInput, setPetNameInput] = useState("");

  async function finishSetup() {

    const hours = calculateGoalHours(Number(age));

    setUserName(name);

    setUserAge(Number(age));

    setGoalHours(hours);

    setGoalType(goal);

    setPetNames((prev) => ({
      ...prev,
      cat: petNameInput,
    }));

    navigation.reset({

      index: 0,

      routes: [

        {

          name: "Home",

        },

      ],

    });

  }

  return (

    <NightBackground moon={false}>

      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >

          {/* Indicador de paso */}

          <View style={styles.stepPill}>

            <AppText style={styles.stepText}>
              {t.step} {step} {t.of} 4
            </AppText>

          </View>

          {
            step === 1 && (

              <>

                <AppText style={styles.title}>
                  {t.whatsYourName}
                </AppText>

                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder={t.yourName}
                  placeholderTextColor="#B8B2E8"
                  cursorColor={NIGHT.end}
                  style={styles.input}
                />

                <TouchableOpacity
                  style={[styles.button, !name && styles.buttonDisabled]}
                  disabled={!name}
                  onPress={() => setStep(2)}
                >

                  <AppText style={styles.buttonText}>
                    {t.continue}
                  </AppText>

                </TouchableOpacity>

              </>

            )
          }

          {
            step === 2 && (

              <>

                <AppText style={styles.title}>
                  {t.howOldAreYou}
                </AppText>

                <TextInput
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                  placeholder={t.agePlaceholder}
                  placeholderTextColor="#B8B2E8"
                  cursorColor={NIGHT.end}
                  style={styles.input}
                />

                <TouchableOpacity
                  style={[styles.button, !age && styles.buttonDisabled]}
                  disabled={!age}
                  onPress={() => setStep(3)}
                >

                  <AppText style={styles.buttonText}>
                    {t.continue}
                  </AppText>

                </TouchableOpacity>

              </>

            )
          }

          {
            step === 3 && (

              <>

                <AppText style={styles.title}>
                  {t.whatsYourGoal}
                </AppText>

                {
                  GOAL_OPTIONS.map((option) => {

                    const isSelected = goal === t[option.labelKey];

                    return (
                      <TouchableOpacity
                        key={option.key}
                        style={[styles.option, isSelected && styles.optionSelected]}
                        onPress={() => setGoal(t[option.labelKey])}
                      >

                        <View style={styles.optionIcon}>
                          <AppIcon name={option.icon} size={20} color={NIGHT.yellow} />
                        </View>

                        <AppText style={styles.optionText}>
                          {t[option.labelKey]}
                        </AppText>

                        {
                          isSelected && (
                            <AppIcon name="check" size={16} color={NIGHT.yellow} />
                          )
                        }

                      </TouchableOpacity>
                    );

                  })
                }

                {
                  goal !== "" && (

                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => setStep(4)}
                    >

                      <AppText style={styles.buttonText}>
                        {t.finish}
                      </AppText>

                    </TouchableOpacity>

                  )
                }

              </>

            )
          }

          {
            step === 4 && (

              <>

                <AppText style={styles.title}>
                  {t.nameYourPet}
                </AppText>

                <Image
                  source={PET_IMAGES.cat.happy}
                  style={styles.pet}
                />

                <TextInput
                  value={petNameInput}
                  onChangeText={setPetNameInput}
                  placeholder={t.petNamePlaceholder}
                  placeholderTextColor="#B8B2E8"
                  cursorColor={NIGHT.end}
                  style={styles.input}
                />

                <TouchableOpacity
                  style={styles.button}
                  onPress={finishSetup}
                >

                  <AppText style={styles.buttonText}>
                    {t.finish}
                  </AppText>

                </TouchableOpacity>

              </>

            )
          }

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
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 26,
    paddingVertical: 30,
  },

  stepPill: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginBottom: 36,
  },

  stepText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontFamily: "Nunito_800ExtraBold",
    textAlign: "center",
    marginBottom: 26,
  },

  pet: {
    width: 150,
    height: 150,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(150,130,255,0.35)",
    borderRadius: 16,
    padding: 16,
    fontSize: 18,
    color: "#FFFFFF",
    marginBottom: 26,
  },

  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(150,130,255,0.2)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },

  optionSelected: {
    borderColor: NIGHT.yellow,
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  optionText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
  },

  button: {
    marginTop: 26,
    backgroundColor: NIGHT.end,
    padding: 18,
    borderRadius: 20,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  buttonDisabled: {
    opacity: 0.4,
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    fontFamily: "Nunito_800ExtraBold",
  },

});
