import React, {
  useContext,
  useEffect,
  useRef,
} from "react";
import {
  ScrollView,
  View,
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
import styles from "./styles/ProfileScreen.styles";

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

