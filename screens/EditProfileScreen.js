import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { AppContext } from "../context/AppContext";
import { COLORS, FONT } from "../constants/theme";

import {
  getTranslations,
} from "../services/TranslationService";

import {
  calculateGoalHours,
} from "../utils/sleepUtils";

export default function EditProfileScreen({ navigation }) {

  const {

    userName,
    setUserName,

    userAge,
    setUserAge,

    goalHours,
    setGoalHours,

    language,

  } = useContext(AppContext);

  const t = getTranslations(language);

  const [name, setName] = useState(userName);

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

    setUserAge(Number(age));

    setGoalHours(Number(goal));

    navigation.goBack();

  }

  return (

    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom:40,
      }}
      showsVerticalScrollIndicator={false}
    >

      <Text style={styles.title}>
        ✏️ {t.editProfile}
      </Text>

      <View style={styles.card}>

        <Text style={styles.label}>
          {t.name}
        </Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t.yourName}
          style={styles.input}
        />

      </View>

      <View style={styles.card}>

        <Text style={styles.label}>
          {t.age}
        </Text>

        <TextInput
          value={age}
          onChangeText={setAge}
          placeholder={t.age}
          keyboardType="numeric"
          style={styles.input}
        />

      </View>

      <View style={styles.card}>

        <Text style={styles.label}>
          {t.sleepGoal} ({t.hours})
        </Text>

        <TextInput
          value={goal}
          onChangeText={setGoal}
          keyboardType="numeric"
          style={styles.input}
        />

        {
          recommendedHours &&
          recommendedHours !== Number(goal) && (
            <TouchableOpacity
              style={styles.recommended}
              onPress={() =>
                setGoal(String(recommendedHours))
              }
            >
              <Text style={styles.recommendedText}>
                💡 {
                  t.recommendedHours.replace(
                    "{{hours}}",
                    recommendedHours
                  )
                }
              </Text>
            </TouchableOpacity>
          )
        }

      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={saveProfile}
      >

        <Text style={styles.buttonText}>
          💾 {t.saveChanges}
        </Text>

      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
      >

        <Text style={styles.buttonText}>
          {t.cancel}
        </Text>

      </TouchableOpacity>

    </ScrollView>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },

  title: {
    fontSize: FONT.title,
    fontWeight: "bold",
    textAlign: "center",
    color: COLORS.text,
    marginBottom: 25,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    elevation: 4,
  },

  label: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },

  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 18,
    color: COLORS.text,
  },

  recommended: {
    marginTop: 12,
    backgroundColor: "#E8E9FA",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    alignItems: "center",
  },

  recommendedText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
    saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 10,
  },

  cancelButton: {
    backgroundColor: "#888",
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 15,
  },

  buttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },

});