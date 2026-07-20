import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";

import { AppContext } from "../context/AppContext";
import { COLORS, FONT } from "../constants/theme";
import { PET_IMAGES } from "../constants/PetImages";
import {
  getTranslations,
} from "../services/TranslationService";

export default function ResultsScreen({ navigation }) {

  const {

    lastSleepSession,

    selectedPet,

    language,

  } = useContext(AppContext);

  const t = getTranslations(language);

  if (!lastSleepSession) {

    return (

      <View style={styles.container}>

        <Text style={styles.empty}>
          {t.noSleepSession}
        </Text>

      </View>

    );

  }

  function getTitle() {

    switch (lastSleepSession.mood) {

      case "happy":
        return t.excellentSleep;

      case "normal":
        return t.goodSleep;

      case "sleepy":
        return t.needMoreRest;

      default:
        return t.trySleepingLonger;

    }

  }

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        {getTitle()}
      </Text>

      <Image
        source={PET_IMAGES[selectedPet][lastSleepSession.mood]}
        style={styles.pet}
      />

      <View style={styles.card}>

        <Text style={styles.label}>
          {t.sleepTime}
        </Text>

        <Text style={styles.value}>
          {lastSleepSession.hours} {t.hours}
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.label}>
          {t.sleepQuality}
        </Text>

        <Text style={styles.value}>
          😴 {lastSleepSession.quality}
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.label}>
          {t.sleepScore}
        </Text>

        <Text style={styles.value}>
          💯 {lastSleepSession.score}/100
        </Text>

      </View>

      <View style={styles.card}>

        <Text style={styles.label}>
        📱 {t.phoneUnlocks}
       </Text>

       <Text style={styles.value}>
       {lastSleepSession.unlockCount}
       </Text>
     </View>

     <View style={styles.card}>

       <Text style={styles.label}>
       ⚠️ {t.penalty}
       </Text>

       <Text style={styles.value}>
        {lastSleepSession.penalty > 0
        ? `-${lastSleepSession.penalty}`
        : t.none}
       </Text>

</View>

      <View style={styles.rewardRow}>

        <View style={styles.rewardCard}>

          <Text style={styles.rewardIcon}>
            💰
          </Text>

          <Text style={styles.rewardValue}>
            +{lastSleepSession.coins}
          </Text>

          <Text style={styles.rewardLabel}>
            {t.coins}
          </Text>

        </View>

        <View style={styles.rewardCard}>

          <Text style={styles.rewardIcon}>
            ⭐
          </Text>

          <Text style={styles.rewardValue}>
            +{lastSleepSession.earnedXP}
          </Text>

          <Text style={styles.rewardLabel}>
            XP
          </Text>

        </View>

      </View>

      {lastSleepSession.levelUp && (

        <View style={styles.levelUpCard}>

          <Text style={styles.levelUpTitle}>
            {t.levelUp}
          </Text>

          <Text style={styles.levelUpText}>
            {t.congratulations}
          </Text>

          <Text style={styles.levelUpText}>
            {t.youReachedLevel} {lastSleepSession.newLevel}
          </Text>

        </View>

      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Home")}
      >

        <Text style={styles.buttonText}>
          {t.continue}
        </Text>

      </TouchableOpacity>

    </View>

  );

}


const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:COLORS.background,
    alignItems:"center",
    justifyContent:"center",
    padding:20,
  },

  empty:{
    fontSize:20,
    color:COLORS.text,
  },

  title:{
    fontSize:FONT.title,
    fontWeight:"bold",
    color:COLORS.text,
    marginBottom:15,
    textAlign:"center",
  },

  pet:{
    width:180,
    height:180,
    resizeMode:"contain",
    marginBottom:20,
  },

  card:{
    width:"100%",
    backgroundColor:"white",
    borderRadius:20,
    padding:18,
    marginBottom:15,
    alignItems:"center",
    elevation:4,
  },

  label:{
    color:COLORS.textSecondary,
    fontSize:17,
    marginBottom:5,
  },

  value:{
    fontSize:24,
    fontWeight:"bold",
    color:COLORS.text,
  },

  rewardRow:{
    flexDirection:"row",
    justifyContent:"space-between",
    width:"100%",
    marginBottom:20,
  },

  rewardCard:{
    width:"48%",
    backgroundColor:"white",
    borderRadius:20,
    padding:20,
    alignItems:"center",
    elevation:4,
  },

  rewardIcon:{
    fontSize:38,
  },

  rewardValue:{
    fontSize:28,
    fontWeight:"bold",
    marginTop:10,
    color:COLORS.text,
  },

  rewardLabel:{
    marginTop:6,
    color:COLORS.textSecondary,
    fontSize:16,
  },

  levelUpCard:{
    width:"100%",
    backgroundColor:"#FFE082",
    borderRadius:20,
    padding:20,
    alignItems:"center",
    marginBottom:20,
    elevation:6,
  },

  levelUpTitle:{
    fontSize:28,
    fontWeight:"bold",
    color:"#C77700",
    marginBottom:8,
  },

  levelUpText:{
    fontSize:18,
    fontWeight:"600",
    color:"#7A5200",
  },

  button:{
    backgroundColor:COLORS.primary,
    paddingHorizontal:60,
    paddingVertical:18,
    borderRadius:20,
    elevation:5,
  },

  buttonText:{
    color:"white",
    fontSize:20,
    fontWeight:"bold",
  },

});