import React, {
  useEffect,
  useState,
  useContext,
  useRef,
} from "react";
import {
  StyleSheet,
  FlatList,
  View,
  Animated,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppContext } from "../context/AppContext";

import {
  getTranslations,
} from "../services/TranslationService";

import { getSleepHistory } from "../storage/SleepStorage";
import { NIGHT } from "../constants/theme";

import NightBackground from "../components/NightBackground";
import AppText from "../components/AppText";
import AppIcon from "../components/AppIcon";
import SleepCard from "../components/SleepCard";

export default function HistoryScreen({ navigation }) {

  const [history, setHistory] = useState([]);

  const { language } = useContext(AppContext);

  const t = getTranslations(language);

  const appear = useRef(new Animated.Value(0)).current;

  useEffect(() => {

    Animated.timing(appear, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    loadHistory();

  }, [appear]);

  async function loadHistory() {

    const data = await getSleepHistory();

    setHistory(data);

  }

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

        <Animated.View
          style={[
            styles.wrap,
            {
              opacity: fadeOpacity,
              transform: [{ translateY: fadeTranslate }],
            },
          ]}
        >

          {/* Header */}

          <View style={styles.headerRow}>

            <TouchableOpacity
              style={styles.circleButton}
              onPress={() => navigation.goBack()}
            >
              <AppIcon name="back" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.headerCenter}>

              <AppText style={styles.title}>
                {t.sleepHistory}
              </AppText>

              <AppText style={styles.subtitle}>
                {t.historySubtitle}
              </AppText>

            </View>

            <View style={styles.circleButton}>
              <AppIcon name="calendar" size={20} color={NIGHT.yellow} />
            </View>

          </View>

          {
            history.length === 0 ? (

              <View style={styles.emptyCard}>

                <AppIcon
                  name="night"
                  size={36}
                  color={NIGHT.yellow}
                  style={styles.emptyIcon}
                />

                <AppText style={styles.emptyTitle}>
                  {t.emptyHistoryTitle}
                </AppText>

                <AppText style={styles.emptyMessage}>
                  {t.emptyHistoryMessage}
                </AppText>

              </View>

            ) : (

              <FlatList
                data={history}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <SleepCard session={item} />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.list}
              />

            )
          }

        </Animated.View>

      </SafeAreaView>

    </NightBackground>

  );

}

const styles = StyleSheet.create({

  safe: {
    flex: 1,
  },

  wrap: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 10,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontFamily: "Nunito_800ExtraBold",
  },

  subtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    marginTop: 2,
  },

  list: {
    paddingBottom: 30,
  },

  emptyCard: {
    alignItems: "center",
    marginTop: 40,
    paddingHorizontal: 24,
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
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    marginTop: 6,
  },

});
