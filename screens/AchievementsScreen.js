import React, { useContext } from "react";
import {
  StyleSheet,
  FlatList,
} from "react-native";

import { AppContext } from "../context/AppContext";

import AchievementCard from "../components/AchievementCard";

import {
  checkAchievements,
} from "../services/AchievementService";

import {
  getTranslations,
} from "../services/TranslationService";

import ScreenContainer from "../components/ScreenContainer";
import AppText from "../components/AppText";

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

    <ScreenContainer style={styles.container}>

      <AppText
        variant="title"
        style={styles.title}
      >
        🏆 {t.achievements}
      </AppText>

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

    </ScreenContainer>

  );

}

const styles = StyleSheet.create({

  container: {

    paddingTop: 55,

    paddingHorizontal: 20,

  },

  title: {

    marginBottom: 20,

  },

  list: {

    paddingBottom: 30,

  },

});
