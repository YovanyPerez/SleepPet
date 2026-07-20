import React, {
  useEffect,
  useState,
  useContext,
} from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
} from "react-native";

import { AppContext } from "../context/AppContext";

import {
  getTranslations,
} from "../services/TranslationService";

import { COLORS, FONT } from "../constants/theme";
import { getSleepHistory } from "../storage/SleepStorage";
import StatCard from "../components/StatCard";

export default function StatisticsScreen() {

  const { language } = useContext(AppContext);

  const t = getTranslations(language);

  const [averageSleep, setAverageSleep] = useState(0);
  const [bestSleep, setBestSleep] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  const [totalNights, setTotalNights] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [perfectNights, setPerfectNights] = useState(0);
  const [totalXP, setTotalXP] = useState(0);

  useEffect(() => {

    loadStatistics();

  }, []);

  async function loadStatistics() {

    const history = await getSleepHistory();

    if (history.length === 0) return;

    let totalHours = 0;
    let maxHours = 0;
    let coins = 0;
    let score = 0;
    let best = 0;
    let perfect = 0;
    let xp = 0;

    history.forEach(session => {

      totalHours += session.hours;
      coins += session.coins;
      score += session.score;
      xp += session.earnedXP;

      if (session.hours > maxHours) {
        maxHours = session.hours;
      }

      if (session.score > best) {
        best = session.score;
      }

      if (session.score >= 90) {
        perfect++;
      }

    });

    setAverageSleep(
      (totalHours / history.length).toFixed(1)
    );

    setBestSleep(maxHours);
    setTotalCoins(coins);
    setTotalNights(history.length);

    setAverageScore(
      Math.round(score / history.length)
    );

    setBestScore(best);
    setPerfectNights(perfect);
    setTotalXP(xp);

  }

  return (

    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >

      <Text style={styles.title}>
        📊 {t.statistics}
      </Text>

      <View style={styles.grid}>

        <StatCard
          icon="😴"
          label={t.average}
          value={`${averageSleep} h`}
        />

        <StatCard
          icon="🌙"
          label={t.best}
          value={`${bestSleep} h`}
        />

        <StatCard
          icon="💰"
          label={t.coins}
          value={totalCoins}
        />

        <StatCard
          icon="📅"
          label={t.nights}
          value={totalNights}
        />

        <StatCard
          icon="💯"
          label={t.averageScore}
          value={averageScore}
        />

        <StatCard
          icon="🏆"
          label={t.bestScore}
          value={bestScore}
        />

        <StatCard
          icon="⭐"
          label={t.totalXP}
          value={totalXP}
        />

        <StatCard
          icon="🌟"
          label={t.perfect}
          value={perfectNights}
        />

      </View>

    </ScrollView>

  );

}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:COLORS.background,
    padding:20,
  },

  content:{
    paddingBottom:40,
  },

  title:{
    fontSize:FONT.title,
    fontWeight:"bold",
    textAlign:"center",
    color:COLORS.text,
    marginBottom:30,
  },

  grid:{
    flexDirection:"row",
    flexWrap:"wrap",
    justifyContent:"space-between",
  },

});