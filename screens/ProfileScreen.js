import React, {
  useContext,
  useEffect,
  useRef,
} from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppContext } from "../context/AppContext";
import { PET_IMAGES } from "../constants/PetImages";
import { NIGHT } from "../constants/theme";

import {
  getTranslations,
} from "../services/TranslationService";

import NightBackground from "../components/NightBackground";
import AppText from "../components/AppText";
import AppIcon from "../components/AppIcon";
import SectionHeader from "../components/SectionHeader";
import ProgressBar from "../components/ProgressBar";

export default function ProfileScreen({ navigation }) {

  const {

    userName,
    userAge,

    goalHours,

    selectedPet,

    petMood,

    level,
    xp,

    coins,

    streak,

    sleepHistory,

    language,

  } = useContext(AppContext);

  const t = getTranslations(language);

  const appear = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(appear, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [appear]);

  const fadeOpacity = appear.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const fadeTranslate = appear.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  return (

    <NightBackground moon={false}>

      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >

          <Animated.View
            style={{
              opacity: fadeOpacity,
              transform: [{ translateY: fadeTranslate }],
            }}
          >

            {/* Header */}

            <View style={styles.header}>

              <View style={styles.headerIconBox}>
                <AppIcon name="person" size={24} color={NIGHT.yellow} />
              </View>

              <AppText style={styles.title}>
                {t.myProfile}
              </AppText>

            </View>

            {/* Mascota */}

            <View style={styles.petWrap}>

              <View style={styles.petGlow} />

              <Image
                source={PET_IMAGES[selectedPet][petMood]}
                style={styles.pet}
              />

            </View>

            {/* Identidad */}

            <View style={styles.glassCard}>

              <AppText style={styles.userName}>
                {userName}
              </AppText>

              <AppText style={styles.userSubtitle}>
                {t.profileSubtitle}
              </AppText>

            </View>

            {/* Información personal */}

            <SectionHeader
              icon="person"
              iconColor="#8FA3FF"
              title={t.infoSection}
            />

            <View style={styles.glassCard}>

              <View style={styles.infoRow}>

                <View style={styles.infoIcon}>
                  <AppIcon name="person" size={18} color="#8FA3FF" />
                </View>

                <View style={styles.infoText}>

                  <AppText style={styles.infoLabel}>
                    {t.name}
                  </AppText>

                  <AppText style={styles.infoValue}>
                    {userName}
                  </AppText>

                </View>

              </View>

              <View style={styles.rowDivider} />

              <View style={styles.infoRow}>

                <View style={styles.infoIcon}>
                  <AppIcon name="cake" size={18} color={NIGHT.pink} />
                </View>

                <View style={styles.infoText}>

                  <AppText style={styles.infoLabel}>
                    {t.age}
                  </AppText>

                  <AppText style={styles.infoValue}>
                    {userAge} {t.years}
                  </AppText>

                </View>

              </View>

              <View style={styles.rowDivider} />

              <View style={styles.infoRow}>

                <View style={styles.infoIcon}>
                  <AppIcon name="night" size={18} color={NIGHT.yellow} />
                </View>

                <View style={styles.infoText}>

                  <AppText style={styles.infoLabel}>
                    {t.sleepGoal}
                  </AppText>

                  <AppText style={styles.infoValue}>
                    {goalHours} {t.hours}
                  </AppText>

                </View>

              </View>

            </View>

            {/* Tu progreso */}

            <SectionHeader
              icon="sparkles"
              iconColor={NIGHT.yellow}
              title={t.progressSection}
            />

            <View style={styles.glassCard}>

              {/* XP */}

              <View style={styles.xpBlock}>

                <View style={styles.xpTop}>

                  <View style={styles.xpLeft}>

                    <View style={styles.infoIcon}>
                      <AppIcon name="level" size={18} color={NIGHT.yellow} />
                    </View>

                    <AppText style={styles.xpLevel}>
                      {t.level} {level}
                    </AppText>

                  </View>

                  <AppText style={styles.xpText}>
                    {xp} / 100 {t.xp}
                  </AppText>

                </View>

                <ProgressBar
                  progress={xp}
                  color={NIGHT.end}
                  background="rgba(255,255,255,0.12)"
                  height={10}
                  radius={5}
                />

              </View>

              {/* Grid 2 columnas */}

              <View style={styles.grid}>

                <View style={styles.gridTile}>

                  <View style={styles.gridIcon}>
                    <AppIcon name="level" size={20} color={NIGHT.yellow} />
                  </View>

                  <AppText style={styles.gridLabel}>
                    {t.level}
                  </AppText>

                  <AppText style={styles.gridValue}>
                    {level}
                  </AppText>

                </View>

                <View style={styles.gridTile}>

                  <View style={styles.gridIcon}>
                    <AppIcon name="coins" size={20} color="#F59E0B" />
                  </View>

                  <AppText style={styles.gridLabel}>
                    {t.coins}
                  </AppText>

                  <AppText style={styles.gridValue}>
                    {coins}
                  </AppText>

                </View>

                <View style={styles.gridTile}>

                  <View style={styles.gridIcon}>
                    <AppIcon name="streak" size={20} color="#F97316" />
                  </View>

                  <AppText style={styles.gridLabel}>
                    {t.currentStreak}
                  </AppText>

                  <AppText style={styles.gridValue}>
                    {streak} {t.days}
                  </AppText>

                </View>

                <View style={styles.gridTile}>

                  <View style={styles.gridIcon}>
                    <AppIcon name="sleep" size={20} color="#8FA3FF" />
                  </View>

                  <AppText style={styles.gridLabel}>
                    {t.totalSleepSessions}
                  </AppText>

                  <AppText style={styles.gridValue}>
                    {sleepHistory.length}
                  </AppText>

                </View>

              </View>

            </View>

            {/* Editar perfil */}

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate("EditProfile")}
            >

              <AppIcon
                name="pencil"
                size={20}
                color="#FFFFFF"
                style={styles.editIcon}
              />

              <AppText style={styles.editText}>
                {t.editProfile}
              </AppText>

            </TouchableOpacity>

          </Animated.View>

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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },

  headerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 32,
    fontFamily: "Nunito_800ExtraBold",
  },

  petWrap: {
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 16,
  },

  petGlow: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(107,91,231,0.35)",
  },

  pet: {
    width: 170,
    height: 170,
    resizeMode: "contain",
  },

  glassCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,
  },

  userName: {
    color: "#FFFFFF",
    fontSize: 26,
    fontFamily: "Nunito_800ExtraBold",
    textAlign: "center",
  },

  userSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    marginTop: 4,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },

  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  infoText: {
    marginLeft: 12,
  },

  infoLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontFamily: "Nunito_600SemiBold",
  },

  infoValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Nunito_800ExtraBold",
    marginTop: 1,
  },

  rowDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.10)",
    marginVertical: 4,
  },

  xpBlock: {
    marginBottom: 18,
  },

  xpTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  xpLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  xpLevel: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Nunito_800ExtraBold",
    marginLeft: 10,
  },

  xpText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  gridTile: {
    width: "48%",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 18,
    paddingVertical: 16,
    marginBottom: 12,
  },

  gridIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  gridLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontFamily: "Nunito_600SemiBold",
    textAlign: "center",
  },

  gridValue: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "Nunito_800ExtraBold",
    marginTop: 2,
  },

  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: NIGHT.end,
    borderRadius: 24,
    height: 60,
    marginTop: 6,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },

  editIcon: {
    marginRight: 8,
  },

  editText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Nunito_800ExtraBold",
  },

});
