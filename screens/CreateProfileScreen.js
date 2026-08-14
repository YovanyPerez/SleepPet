import React, { useState, useContext } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

import { AppContext } from "../context/AppContext";
import { COLORS } from "../constants/theme";
import { getTranslations } from "../services/TranslationService";
import { calculateGoalHours } from "../utils/sleepUtils";

import ScreenContainer from "../components/ScreenContainer";
import AppText from "../components/AppText";

export default function CreateProfileScreen({ navigation }) {

  const {
    setUserName,
    setUserAge,
    setGoalHours,
    setGoalType,
    language,
  } = useContext(AppContext);

  const t = getTranslations(language);

  const [step, setStep] = useState(1);

  const [name, setName] = useState("");

  const [age, setAge] = useState("");

  const [goal, setGoal] = useState("");

  async function finishSetup() {

    const hours = calculateGoalHours(Number(age));

    setUserName(name);

    setUserAge(Number(age));

    setGoalHours(hours);

    setGoalType(goal);

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

    <ScreenContainer style={styles.container}>

      <AppText
        color={COLORS.textSecondary}
        style={styles.progress}
      >
        {t.step} {step} {t.of} 3
      </AppText>

      {

        step === 1 && (

          <>

            <AppText
              variant="title"
              center
              style={styles.title}
            >
              {t.whatsYourName}
            </AppText>

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={t.yourName}
              style={styles.input}
            />

            <TouchableOpacity
              style={styles.button}
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

            <AppText
              variant="title"
              center
              style={styles.title}
            >
              {t.howOldAreYou}
            </AppText>

            <TextInput
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              placeholder={t.agePlaceholder}
              style={styles.input}
            />

            <TouchableOpacity
              style={styles.button}
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

            <AppText
              variant="title"
              center
              style={styles.title}
            >
              {t.whatsYourGoal}
            </AppText>

            <TouchableOpacity
              style={styles.option}
              onPress={() => setGoal(t.goalImproveSleep)}
            >

              <AppText>
                😴 {t.goalImproveSleep}
              </AppText>

            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={() => setGoal(t.goalHealthyHabits)}
            >

              <AppText>
                🌱 {t.goalHealthyHabits}
              </AppText>

            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={() => setGoal(t.goalMoreEnergy)}
            >

              <AppText>
                ⚡ {t.goalMoreEnergy}
              </AppText>

            </TouchableOpacity>

            {

              goal !== "" && (

                <TouchableOpacity
                  style={styles.button}
                  onPress={finishSetup}
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

    </ScreenContainer>

  );

}

const styles = StyleSheet.create({

  container: {
    justifyContent: "center",
    padding: 25,
  },

  progress: {
    textAlign: "center",
    marginBottom: 40,
    fontSize: 16,
  },

  title: {
    marginBottom: 25,
  },

  input: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    fontSize: 18,
    marginBottom: 25,
    color: COLORS.text,
  },

  option: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
  },

  button: {
    marginTop: 30,
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },

});
