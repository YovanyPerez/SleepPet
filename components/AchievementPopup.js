import React, { useContext, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from "react-native";

import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { AppContext } from "../context/AppContext";
import { getTranslations } from "../services/TranslationService";
import { NIGHT } from "../constants/theme";
import AppText from "./AppText";
import AppIcon from "./AppIcon";

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

/**
 * Popup global de logro desbloqueado (overlay en AppNavigator).
 * Se cierra con toque en cualquier lado o solo tras 2.8s.
 */
export default function AchievementPopup({
  visible,
  title,
  reward,
  onHide,
}) {
  const { language } = useContext(AppContext);

  const t = getTranslations(language);

  const reduced = useReducedMotion();

  // Entrada de la card (scale 0.95 -> 1 + opacity) y pulse único del icono.
  const enter = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (!visible) {
      enter.set(0);
      pulse.set(1);
      return;
    }
    enter.set(
      withTiming(1, { duration: reduced ? 150 : 220, easing: EASE_OUT })
    );
    if (!reduced) {
      pulse.set(
        withSequence(
          withTiming(1.06, { duration: 150, easing: EASE_OUT }),
          withTiming(1, { duration: 150, easing: EASE_OUT })
        )
      );
    }
    const timer = setTimeout(() => {
      onHide?.();
    }, 2800);
    return () => clearTimeout(timer);
  }, [visible, onHide, reduced, enter, pulse]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: enter.get(),
    transform: [{ scale: reduced ? 1 : 0.95 + 0.05 * enter.get() }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.get() }],
  }));

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={() => onHide?.()}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => onHide?.()}
      >
        <Animated.View style={[styles.card, cardStyle]}>

          <Animated.View style={[styles.iconCircle, iconStyle]}>
            <AppIcon name="achievements" size={34} color={NIGHT.yellow} />
          </Animated.View>

          <AppText style={styles.header}>
            {t.achievementUnlocked}
          </AppText>

          <AppText style={styles.name}>
            {title}
          </AppText>

          <AppText style={styles.reward}>
            +{reward} {t.coins}
          </AppText>

        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.65)",
  },

  card: {
    width: 300,
    backgroundColor: "#1D1B5B",
    borderWidth: 1,
    borderColor: "rgba(150,130,255,0.3)",
    borderRadius: 26,
    padding: 28,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
  },

  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(255,209,102,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  header: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
    textAlign: "center",
  },

  name: {
    color: "#FFFFFF",
    fontSize: 19,
    fontFamily: "Nunito_800ExtraBold",
    textAlign: "center",
    marginTop: 8,
  },

  reward: {
    color: NIGHT.yellow,
    fontSize: 17,
    fontFamily: "Nunito_700Bold",
    marginTop: 16,
  },
});
