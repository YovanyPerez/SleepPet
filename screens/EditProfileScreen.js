import React, { useContext, useState } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { AppContext } from "../context/AppContext";
import { COLORS } from "../constants/theme";

import {
  getTranslations,
} from "../services/TranslationService";

import {
  calculateGoalHours,
} from "../utils/sleepUtils";

import ScreenContainer from "../components/ScreenContainer";
import Card from "../components/Card";
import AppText from "../components/AppText";

export default function EditProfileScreen({ navigation }) {

  const {

    userName,
    setUserName,

    petName,
    setPetName,

    userAge,
    setUserAge,

    goalHours,
    setGoalHours,

    language,

  } = useContext(AppContext);

  const t = getTranslations(language);

  const [name, setName] = useState(userName);

  const [petNameInput, setPetNameInput] = useState(petName);

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

    setPetName(petNameInput);

    setUserAge(Number(age));

    setGoalHours(Number(goal));

    navigation.goBack();

  }

  return (

    <ScreenContainer style={styles.screen}>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >

        <AppText
          variant="title"
          center
          style={styles.title}
        >
          ✏️ {t.editProfile}
        </AppText>

        <Card style={styles.card}>

          <AppText
            color={COLORS.textSecondary}
            style={styles.label}
          >
            {t.name}
          </AppText>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t.yourName}
            style={styles.input}
          />

        </Card>

        <Card style={styles.card}>

          <AppText
            color={COLORS.textSecondary}
            style={styles.label}
          >
            {t.petName}
          </AppText>

          <TextInput
            value={petNameInput}
            onChangeText={setPetNameInput}
            placeholder={t.petNamePlaceholder}
            style={styles.input}
          />

        </Card>

        <Card style={styles.card}>

          <AppText
            color={COLORS.textSecondary}
            style={styles.label}
          >
            {t.age}
          </AppText>

          <TextInput
            value={age}
            onChangeText={setAge}
            placeholder={t.age}
            keyboardType="numeric"
            style={styles.input}
          />

        </Card>

        <Card style={styles.card}>

          <AppText
            color={COLORS.textSecondary}
            style={styles.label}
          >
            {t.sleepGoal} ({t.hours})
          </AppText>

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
                <AppText style={styles.recommendedText}>
                  💡 {
                    t.recommendedHours.replace(
                      "{{hours}}",
                      recommendedHours
                    )
                  }
                </AppText>
              </TouchableOpacity>
            )
          }

        </Card>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveProfile}
        >

          <AppText style={styles.buttonText}>
            💾 {t.saveChanges}
          </AppText>

        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >

          <AppText style={styles.buttonText}>
            {t.cancel}
          </AppText>

        </TouchableOpacity>

      </ScrollView>

    </ScreenContainer>

  );

}

const styles = StyleSheet.create({

  screen: {
    padding: 0,
  },

  container: {
    flex: 1,
    padding: 20,
  },

  title: {
    marginBottom: 25,
  },

  card: {
    padding: 18,
    marginBottom: 18,
  },

  label: {
    fontSize: 16,
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
