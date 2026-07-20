import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from "react-native";

import { AppContext } from "../context/AppContext";

import {
  getTranslations,
} from "../services/TranslationService";

import { getSleepHistory } from "../storage/SleepStorage";
import SleepCard from "../components/SleepCard";
import { COLORS, FONT } from "../constants/theme";

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

    <View style={styles.container}>

      <Text style={styles.title}>
        📅 {t.sleepHistory}
      </Text>

      {

        history.length === 0 ?

        <Text style={styles.empty}>
          {t.noSleepSessions}
        </Text>

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

    </View>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },

  title: {
    fontSize: FONT.title,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 20,
    textAlign: "center",
  },

  empty: {
    textAlign: "center",
    marginTop: 80,
    fontSize: 18,
    color: COLORS.textSecondary,
  },

});