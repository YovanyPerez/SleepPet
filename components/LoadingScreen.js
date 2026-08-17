import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Image,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { NIGHT } from "../constants/theme";
import { PET_IMAGES } from "../constants/PetImages";

import NightBackground from "./NightBackground";
import GlowMoon from "./GlowMoon";
import AppText from "./AppText";
import AppIcon from "./AppIcon";

function LoadingDots() {

  const dots = [
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
    useRef(new Animated.Value(0.3)).current,
  ];

  useEffect(() => {
    const loops = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(dot, {
            toValue: 1,
            duration: 450,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 450,
            useNativeDriver: true,
          }),
        ])
      )
    );
    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, []);

  return (
    <View style={styles.dotsRow}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={[styles.dot, { opacity: dot }]}
        />
      ))}
    </View>
  );
}

export default function LoadingScreen({ tagline }) {

  const appear = useRef(new Animated.Value(0)).current;

  const breath = useRef(new Animated.Value(0)).current;

  useEffect(() => {

    Animated.timing(appear, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(breath, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();

    return () => loop.stop();
  }, [appear, breath]);

  const logoOpacity = appear.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const logoTranslate = appear.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  const petScale = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.04],
  });

  const petTranslate = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5],
  });

  return (

    <NightBackground moon={false}>

      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>

        <View style={styles.content}>

          <GlowMoon size={56} />

          <Animated.View
            style={{
              opacity: logoOpacity,
              transform: [{ translateY: logoTranslate }],
              alignItems: "center",
            }}
          >

            <View style={styles.wordmarkRow}>

              <AppText style={styles.wordSleep}>SLEEP</AppText>

              <AppText style={styles.wordPet}>PET</AppText>

              <AppIcon
                name="paw"
                size={26}
                color={NIGHT.yellow}
                style={styles.wordPaw}
              />

            </View>

            <AppText style={styles.tagline}>
              {tagline || "Duerme mejor, cuida a tu mascota"}
            </AppText>

          </Animated.View>

          <View style={styles.petArea}>

            <Animated.Image
              source={PET_IMAGES.cat.happy}
              style={[
                styles.pet,
                {
                  transform: [
                    { scale: petScale },
                    { translateY: petTranslate },
                  ],
                },
              ]}
            />

          </View>

          <LoadingDots />

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
    flex: 1,
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingVertical: 60,
  },

  wordmarkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  wordSleep: {
    color: "#FFFFFF",
    fontSize: 44,
    fontFamily: "Nunito_800ExtraBold",
    letterSpacing: 2,
  },

  wordPet: {
    color: "#B7A9F0",
    fontSize: 44,
    fontFamily: "Nunito_800ExtraBold",
    letterSpacing: 2,
    marginLeft: 10,
  },

  wordPaw: {
    marginLeft: 10,
  },

  tagline: {
    color: "#C9B8E8",
    fontSize: 15,
    fontFamily: "Nunito_400Regular",
    marginTop: 12,
    textAlign: "center",
  },

  petArea: {
    alignItems: "center",
    justifyContent: "center",
  },

  pet: {
    width: 210,
    height: 210,
    resizeMode: "contain",
  },

  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: NIGHT.yellow,
    marginHorizontal: 5,
  },

});
