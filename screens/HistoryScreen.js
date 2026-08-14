import React, { useEffect, useState, useContext } from "react";
import {
  StyleSheet,
  FlatList,
} from "react-native";

import { AppContext } from "../context/AppContext";

import {
  getTranslations,
} from "../services/TranslationService";

import { getSleepHistory } from "../storage/SleepStorage";
import SleepCard from "../components/SleepCard";
import { COLORS } from "../constants/theme";

import ScreenContainer from "../components/ScreenContainer";
import AppText from "../components/AppText";

export default function HistoryScreen() {

  const [history, setHistory] = useState([]);

  const { language } = useContext(AppContext);

  const t = getTranslations(language);

  useEffect(() => {

    loadHistory();

  }, []);

  async function loadHistory() {

    const data = await getSleepHistory();

    setHistory(data);

  }

  return (

    <ScreenContainer>

      <AppText
        variant="title"
        center
        style={styles.title}
      >
        📅 {t.sleepHistory}
      </AppText>

      {

        history.length === 0 ?

        <AppText
          variant="body"
          color={COLORS.textSecondary}
          style={styles.empty}
        >
          {t.noSleepSessions}
        </AppText>

        :

        <FlatList
          data={history}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <SleepCard session={item} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 20,
          }}
        />

      }

    </ScreenContainer>

  );

}

const styles = StyleSheet.create({

  title: {
    marginBottom: 20,
  },

  empty: {
    textAlign: "center",
    marginTop: 80,
  },

});
