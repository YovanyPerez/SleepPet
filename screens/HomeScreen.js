import React, { useContext } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";

import { AppContext } from "../context/AppContext";
import { COLORS, FONT } from "../constants/theme";
import StatCard from "../components/StatCard";
import { PET_IMAGES } from "../constants/PetImages";
import { getTranslations } from "../services/TranslationService";

export default function HomeScreen({ navigation }) {

  const {

    userName,

    streak,

    coins,

    petMood,

    selectedPet,

    level,

    xp,

    language,

  } = useContext(AppContext);

  const t = getTranslations(language);

  function greeting() {

    const hour = new Date().getHours();

    if (hour < 12) return t.greetingMorning;

    if (hour < 18) return t.greetingAfternoon;

    return t.greetingEvening;

  }

  function moodText() {

    switch (petMood) {

      case "happy":
        return t.happy;

      case "normal":
        return t.normal;

      case "sleepy":
        return t.sleepy;

      default:
        return t.sad;

    }

  }

  return (

    <View style={styles.container}>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.header}>

          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => navigation.navigate("PetShop")}
          >

            <Text style={styles.menuIcon}>
              🏪
            </Text>

          </TouchableOpacity>

          <View style={styles.headerCenter}>

            <Text style={styles.greeting}>
              {greeting()}
            </Text>

            <Text style={styles.name}>
              {userName || "Player"} 👋
            </Text>

          </View>

          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => navigation.navigate("Menu")}
          >

            <Text style={styles.menuIcon}>
              ☰
            </Text>

          </TouchableOpacity>

        </View>

        <Image
          source={PET_IMAGES[selectedPet][petMood]}
          style={styles.pet}
        />

        <View style={styles.grid}>

          <StatCard
            icon="🔥"
            label={t.streak}
            value={`${streak} ${t.days}`}
          />

          <StatCard
            icon="💰"
            label={t.coins}
            value={`${coins}`}
          />

          <View style={styles.levelCard}>

            <Text style={styles.levelIcon}>
              ⭐
            </Text>

            <Text style={styles.levelLabel}>
              {t.level}
            </Text>

            <Text style={styles.levelValue}>
              {level}
            </Text>

            <View style={styles.levelBarBackground}>

              <View
                style={[
                  styles.levelBarFill,
                  {
                    width: `${xp}%`,
                  },
                ]}
              />

            </View>

            <Text style={styles.levelXp}>
              {xp} / 100 {t.xp}
            </Text>

          </View>

          <StatCard
            icon="😊"
            label={t.mood}
            value={moodText()}
          />

        </View>

      </ScrollView>

      <View style={styles.bottomContainer}>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => navigation.navigate("SleepMode")}
        >

          <Text style={styles.startText}>
            🌙 {t.startSleep.toUpperCase()}
          </Text>

        </TouchableOpacity>

      </View>

    </View>

  );

}
const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:COLORS.background,
  },

  content:{
    paddingTop:55,
    paddingHorizontal:20,
    paddingBottom:130,
  },

  header:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    marginBottom:20,
  },

  headerCenter:{
    flex:1,
    marginHorizontal:15,
  },

  greeting:{
    color:COLORS.textSecondary,
    fontSize:17,
  },

  name:{
    fontSize:30,
    fontWeight:"bold",
    color:COLORS.text,
    marginTop:4,
  },

  circleButton:{
    width:50,
    height:50,
    borderRadius:25,
    backgroundColor:COLORS.primary,
    justifyContent:"center",
    alignItems:"center",
    elevation:5,
  },

  menuIcon:{
    color:"white",
    fontSize:24,
  },

  pet:{
    width:190,
    height:190,
    resizeMode:"contain",
    alignSelf:"center",
    marginBottom:20,
  },

  grid:{
    flexDirection:"row",
    flexWrap:"wrap",
    justifyContent:"space-between",
  },

  levelCard:{
    width:"48%",
    backgroundColor:"white",
    borderRadius:20,
    padding:18,
    alignItems:"center",
    elevation:4,
    marginBottom:18,
  },

  levelIcon:{
    fontSize:42,
  },

  levelLabel:{
    fontSize:18,
    color:COLORS.textSecondary,
    marginTop:8,
  },

  levelValue:{
    fontSize:34,
    fontWeight:"bold",
    color:COLORS.text,
    marginVertical:6,
  },

  levelBarBackground:{
    width:"100%",
    height:8,
    backgroundColor:"#E5E5E5",
    borderRadius:10,
    overflow:"hidden",
    marginTop:8,
  },

  levelBarFill:{
    height:8,
    backgroundColor:COLORS.primary,
  },

  levelXp:{
    marginTop:8,
    fontSize:12,
    color:COLORS.textSecondary,
  },

  bottomContainer:{
    position:"absolute",
    left:20,
    right:20,
    bottom:25,
  },

  startButton:{
    backgroundColor:COLORS.primary,
    paddingVertical:18,
    borderRadius:20,
    alignItems:"center",
    elevation:6,
  },

  startText:{
    color:"white",
    fontWeight:"bold",
    fontSize:22,
  },

});