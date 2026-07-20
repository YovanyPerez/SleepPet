import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from "react-native";

import { AppContext } from "../context/AppContext";
import { COLORS, FONT } from "../constants/theme";

import AchievementCard from "../components/AchievementCard";

import {
  checkAchievements,
} from "../services/AchievementService";

import {
  getTranslations,
} from "../services/TranslationService";

export default function AchievementsScreen() {

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

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        🏆 {t.achievements}
      </Text>

      <FlatList
        data={achievements}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (

          <AchievementCard
            achievement={item}
          />

        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />

    </View>

  );

}

const styles = StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor: COLORS.background,

    paddingTop: 55,

    paddingHorizontal: 20,

  },

  title: {

    fontSize: FONT.title,

    fontWeight: "bold",

    color: COLORS.text,

    marginBottom: 20,

  },

  list: {

    paddingBottom: 30,

  },

});