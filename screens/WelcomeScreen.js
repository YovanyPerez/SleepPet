import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { AppContext } from "../context/AppContext";
import { getTranslations } from "../services/TranslationService";
import { COLORS, FONT } from "../constants/theme";

export default function WelcomeScreen({ navigation }) {

  const {
    language,
    setLanguage,
  } = useContext(AppContext);

  const t = getTranslations(language);

  return (

    <View style={styles.container}>

      <Text style={styles.logo}>
        🐱
      </Text>

      <Text style={styles.title}>
        {t.welcomeTitle}
      </Text>

      <Text style={styles.subtitle}>
        {t.welcomeSubtitle}
      </Text>

      <View style={styles.languageContainer}>

        <TouchableOpacity
          style={[
            styles.languageButton,
            language === "en" && styles.selectedButton,
          ]}
          onPress={() => setLanguage("en")}
        >

          <Text style={styles.languageText}>
            🇺🇸 English
          </Text>

        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.languageButton,
            language === "es" && styles.selectedButton,
          ]}
          onPress={() => setLanguage("es")}
        >

          <Text style={styles.languageText}>
            🇪🇸 Español
          </Text>

        </TouchableOpacity>

      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("CreateProfile")}
      >

        <Text style={styles.buttonText}>
          {t.getStarted}
        </Text>

      </TouchableOpacity>

    </View>

  );

}

const styles = StyleSheet.create({

  container:{
    flex:1,
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:COLORS.background,
    padding:30,
  },

  logo:{
    fontSize:90,
    marginBottom:25,
  },

  title:{
    fontSize:30,
    fontWeight:"bold",
    color:COLORS.text,
    textAlign:"center",
    marginBottom:15,
  },

  subtitle:{
    fontSize:18,
    color:COLORS.textSecondary,
    textAlign:"center",
    lineHeight:28,
    marginBottom:35,
  },

  languageContainer:{
    flexDirection:"row",
    marginBottom:40,
  },

  languageButton:{
    backgroundColor:"#EAEAEA",
    paddingVertical:14,
    paddingHorizontal:18,
    borderRadius:14,
    marginHorizontal:8,
  },

  selectedButton:{
    backgroundColor:COLORS.primary,
  },

  languageText:{
    color:"white",
    fontWeight:"bold",
    fontSize:16,
  },

  button:{
    backgroundColor:COLORS.primary,
    paddingHorizontal:45,
    paddingVertical:16,
    borderRadius:20,
    elevation:5,
  },

  buttonText:{
    color:"white",
    fontSize:18,
    fontWeight:"bold",
  },

});