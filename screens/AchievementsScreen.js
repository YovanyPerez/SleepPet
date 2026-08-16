import React, {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import { AppContext } from "../context/AppContext";
import { NIGHT } from "../constants/theme";

import NightBackground from "../components/NightBackground";
import AppText from "../components/AppText";
import AppIcon from "../components/AppIcon";
import BottomNav from "../components/BottomNav";
import AchievementCard from "../components/AchievementCard";
import AchievementSummary from "../components/AchievementSummary";
import AchievementFilter from "../components/AchievementFilter";

import {
  checkAchievements,
} from "../services/AchievementService";

import {
  getTranslations,
} from "../services/TranslationService";

export default function AchievementsScreen({ navigation }) {

  const {

    coins,

    streak,

    level,

    ownedPets,

    sleepHistory,

    language,

  } = useContext(AppContext);

  const t = getTranslations(language);

  const achievements = checkAchievements({

    sessions: sleepHistory.length,

    streak,

    coins,

    level,

    pets: ownedPets.length,

  });

  const unlockedCount =
    achievements.filter((a) => a.unlocked).length;

  const [filter, setFilter] = useState("all");

  const appear = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(appear, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [appear]);

  const FILTERS = [
    { key: "all", icon: "trophy", label: t.filterAll },
    { key: "progress", icon: "statistics", label: t.filterProgress },
    { key: "streak", icon: "streak", label: t.filterStreak },
    { key: "special", icon: "diamond", label: t.filterSpecial },
  ];

  const filtered = achievements.filter((a) => {
    switch (filter) {
      case "progress":
        return !a.unlocked && a.progress > 0;
      case "streak":
        return a.type === "streak";
      case "special":
        return a.type === "level" || a.type === "pets";
      default:
        return true;
    }
  });

  const fadeOpacity = appear.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const fadeTranslate = appear.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  return (

    <NightBackground
      colors={[NIGHT.start, "#25256F", "#5751C9"]}
      moon={false}
    >

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

            <LinearGradient
              colors={[NIGHT.end, "#4A3F8F"]}
              style={styles.trophyCircle}
            >
              <AppIcon name="achievements" size={32} color={NIGHT.yellow} />
            </LinearGradient>

            <AppText style={styles.title}>
              {t.achievements}
            </AppText>

            <AppText style={styles.subtitle}>
              {t.achievementsSubtitle}
            </AppText>

            {/* Resumen */}

            <AchievementSummary
              achievements={achievements}
              t={t}
            />

            {
              unlockedCount === 0 ? (

                <View style={styles.emptyCard}>

                  <AppIcon
                    name="night"
                    size={36}
                    color={NIGHT.yellow}
                    style={styles.emptyIcon}
                  />

                  <AppText style={styles.emptyTitle}>
                    {t.noAchievementsTitle}
                  </AppText>

                  <AppText style={styles.emptyMessage}>
                    {t.noAchievementsMessage}
                  </AppText>

                </View>

              ) : (

                <>

                  {/* Filtros */}

                  <AchievementFilter
                    options={FILTERS}
                    active={filter}
                    onChange={setFilter}
                  />

                  {/* Lista */}

                  <View style={styles.list}>

                    {
                      filtered.map((item) => (
                        <AchievementCard
                          key={item.id}
                          achievement={item}
                        />
                      ))
                    }

                  </View>

                </>

              )
            }

          </Animated.View>

        </ScrollView>

        {/* Navegación inferior */}

        <View style={styles.bottomNav}>
          <BottomNav
            active="Achievements"
            t={t}
            navigation={navigation}
          />
        </View>

      </SafeAreaView>

    </NightBackground>

  );

}

const styles = StyleSheet.create({

  safe: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
  },

  trophyCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 34,
    fontFamily: "Nunito_800ExtraBold",
    textAlign: "center",
    marginTop: 16,
  },

  subtitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 16,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
  },

  emptyCard: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginTop: 24,
  },

  emptyIcon: {
    marginBottom: 10,
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "Nunito_800ExtraBold",
    textAlign: "center",
  },

  emptyMessage: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    marginTop: 6,
  },

  list: {
    width: "100%",
    marginTop: 16,
  },

  bottomNav: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 22,
  },

});
