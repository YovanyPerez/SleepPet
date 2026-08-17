import React, { useState, useContext } from "react";
import {
  View,
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
import styles from "./styles/CreateProfileScreen.styles";

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

