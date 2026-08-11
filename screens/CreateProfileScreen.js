import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

import { AppContext } from "../context/AppContext";
import { COLORS, FONT } from "../constants/theme";
import { getTranslations } from "../services/TranslationService";
import { calculateGoalHours } from "../utils/sleepUtils";

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

    <View style={styles.container}>

      <Text style={styles.progress}>
        {t.step} {step} {t.of} 3
      </Text>

      {

        step === 1 && (

          <>

            <Text style={styles.title}>
              {t.whatsYourName}
            </Text>

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

              <Text style={styles.buttonText}>
                {t.continue}
              </Text>

            </TouchableOpacity>

          </>

        )

      }

      {

        step === 2 && (

          <>

            <Text style={styles.title}>
              {t.howOldAreYou}
            </Text>

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

              <Text style={styles.buttonText}>
                {t.continue}
              </Text>

            </TouchableOpacity>

          </>

        )

      }

      {

        step === 3 && (

          <>

            <Text style={styles.title}>
              {t.whatsYourGoal}
            </Text>

            <TouchableOpacity
              style={styles.option}
              onPress={() => setGoal(t.goalImproveSleep)}
            >

              <Text>
                😴 {t.goalImproveSleep}
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={() => setGoal(t.goalHealthyHabits)}
            >

              <Text>
                🌱 {t.goalHealthyHabits}
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={() => setGoal(t.goalMoreEnergy)}
            >

              <Text>
                ⚡ {t.goalMoreEnergy}
              </Text>

            </TouchableOpacity>

            {

              goal !== "" && (

                <TouchableOpacity
                  style={styles.button}
                  onPress={finishSetup}
                >

                  <Text style={styles.buttonText}>
                    {t.finish}
                  </Text>

                </TouchableOpacity>

              )

            }

          </>

        )

      }

    </View>

  );

}

const styles = StyleSheet.create({

  container:{
    flex:1,
    justifyContent:"center",
    padding:25,
    backgroundColor:COLORS.background,
  },

  progress:{
    textAlign:"center",
    marginBottom:40,
    color:COLORS.textSecondary,
    fontSize:16,
  },

  title:{
    fontSize:FONT.title,
    fontWeight:"bold",
    marginBottom:25,
    textAlign:"center",
    color:COLORS.text,
  },

  input:{
    backgroundColor:"white",
    borderRadius:15,
    padding:15,
    fontSize:18,
    marginBottom:25,
  },

  option:{
    backgroundColor:"white",
    padding:18,
    borderRadius:15,
    marginBottom:15,
  },

  button:{
    marginTop:30,
    backgroundColor:COLORS.primary,
    padding:18,
    borderRadius:15,
    alignItems:"center",
  },

  buttonText:{
    color:"white",
    fontWeight:"bold",
    fontSize:18,
  },

});