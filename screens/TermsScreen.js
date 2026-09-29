import React, {
  useContext,
  useState,
} from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppContext } from "../context/AppContext";
import { getTranslations } from "../services/TranslationService";
import { hasExistingUserData } from "../services/UserDataService";

import NightBackground from "../components/NightBackground";
import AppText from "../components/AppText";
import AppIcon from "../components/AppIcon";
import styles from "./styles/TermsScreen.styles";

// Términos y Privacidad: paso obligatorio tras Welcome (checkbox + botón
// deshabilitado hasta aceptar) y lectura desde About (readOnly, sin casilla)
export default function TermsScreen({ navigation, route }) {

  const ctx = useContext(AppContext);

  const {
    setHasAcceptedTerms,
    language,
  } = ctx;

  const t = getTranslations(language);

  const readOnly = route?.params?.readOnly === true;

  const [accepted, setAccepted] = useState(false);

  async function handleContinue() {
    if (!accepted) return;
    await setHasAcceptedTerms(true);
    // Existente (datos de antes de esta pantalla) → Tabs; nuevo → perfil
    navigation.replace(hasExistingUserData(ctx) ? "Tabs" : "CreateProfile");
  }

  return (

    <NightBackground moon={false}>

      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >

          <AppText style={styles.title}>
            {t.termsTitle}
          </AppText>

          <View style={styles.card}>
            <AppText style={styles.paragraph}>{t.termsP1}</AppText>
            <AppText style={styles.paragraph}>{t.termsP2}</AppText>
            <AppText style={styles.paragraph}>{t.termsP3}</AppText>
            <AppText style={[styles.paragraph, { marginBottom: 0 }]}>{t.termsP4}</AppText>
          </View>

          {
            !readOnly && (
              <TouchableOpacity
                style={styles.checkRow}
                activeOpacity={0.7}
                onPress={() => setAccepted((v) => !v)}
              >
                <View style={[styles.checkbox, accepted && styles.checkboxOn]}>
                  {accepted && (
                    <AppIcon name="check" size={16} color="#FFFFFF" />
                  )}
                </View>
                <AppText style={styles.checkText}>
                  {t.termsAccept}
                </AppText>
              </TouchableOpacity>
            )
          }

          {
            !readOnly ? (
              <TouchableOpacity
                style={[styles.continueButton, !accepted && styles.continueButtonDisabled]}
                activeOpacity={accepted ? 0.7 : 1}
                onPress={handleContinue}
              >
                <AppText style={styles.continueText}>
                  {t.termsContinue.toUpperCase()}
                </AppText>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <AppText style={styles.backText}>
                  {t.back ?? "Volver"}
                </AppText>
              </TouchableOpacity>
            )
          }

        </ScrollView>

      </SafeAreaView>

    </NightBackground>

  );

}
