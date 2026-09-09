import React, { useEffect, useRef, useState } from "react";
import { View, TouchableOpacity, Dimensions, Animated, StyleSheet } from "react-native";
import AppText from "./AppText";
import AppIcon from "./AppIcon";
import Card from "./Card";
import { COLORS, NIGHT } from "../constants/theme";

const HOLE_PAD = 10;

// Spotlight sobre elementos reales de Home: overlay oscuro con hueco en el
// target medido + burbuja con título/cuerpo + navegación Atrás/Siguiente/Saltar.
// Condiciones de arquitectura:
// - Sin tooltip hasta que el target tenga medición válida (layouts[step.key]
//   nulo → solo dim, sin hueco ni burbuja; el padre re-mide en cada paso/focus).
// - Recalcula con Dimensions en cada render + listener de cambio (rotación).
export default function OnboardingOverlay({
  steps,
  stepIndex,
  layouts,
  onBack,
  onNext,
  onSkip,
  onFinish,
  t,
}) {
  const step = steps[stepIndex];
  const layout = step ? layouts[step.key] : null;

  const [window, setWindow] = useState(() => Dimensions.get("window"));

  useEffect(() => {
    const sub = Dimensions.addEventListener("change", ({ window: w }) => {
      setWindow(w);
    });
    return () => sub?.remove?.();
  }, []);

  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [fade, stepIndex, layout ? layout.x : -1, layout ? layout.y : -1]);

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;

  // Sin medición válida: dim sin hueco ni burbuja (espera, no aproxima)
  if (!step || !layout || layout.width <= 0 || layout.height <= 0) {
    return <View style={styles.dim} pointerEvents="auto" />;
  }

  const hole = {
    x: Math.max(0, layout.x - HOLE_PAD),
    y: Math.max(0, layout.y - HOLE_PAD),
    width: layout.width + HOLE_PAD * 2,
    height: layout.height + HOLE_PAD * 2,
  };

  // Burbuja arriba si el hueco está en la mitad inferior, si no abajo.
  // lift: subida extra del paso (tabs) para no morder el target.
  const bubbleGap = 16 + (step.lift ?? 0);
  const bubbleOnTop = hole.y + hole.height / 2 > window.height * 0.45;

  return (
    <View style={styles.root} pointerEvents="auto">
      {/* Dim: 4 bandas alrededor del hueco */}
      <View style={[styles.dimBand, { left: 0, right: 0, top: 0, height: hole.y }]} />
      <View style={[styles.dimBand, { left: 0, right: 0, top: hole.y + hole.height, bottom: 0 }]} />
      <View style={[styles.dimBand, { left: 0, width: hole.x, top: hole.y, height: hole.height }]} />
      <View style={[styles.dimBand, { left: hole.x + hole.width, right: 0, top: hole.y, height: hole.height }]} />

      {/* Resaltado del hueco */}
      <View
        style={[
          styles.hole,
          { left: hole.x, top: hole.y, width: hole.width, height: hole.height },
        ]}
        pointerEvents="none"
      />

      <Animated.View
        style={[
          styles.bubbleWrap,
          bubbleOnTop
            ? { bottom: window.height - hole.y + bubbleGap }
            : { top: hole.y + hole.height + bubbleGap },
          { opacity: fade },
        ]}
        pointerEvents="box-none"
      >
        <Card style={styles.bubble}>
          <View style={styles.bubbleHeader}>
            <AppIcon name={step.icon} size={22} color={NIGHT.yellow} />
            <AppText style={styles.bubbleTitle}>{step.title}</AppText>
          </View>
          <AppText style={styles.bubbleBody}>{step.body}</AppText>

          <View style={styles.dots}>
            {steps.map((s, i) => (
              <View key={s.key} style={[styles.dot, i === stepIndex && styles.dotActive]} />
            ))}
          </View>

          <View style={styles.navRow}>
            <TouchableOpacity
              style={[styles.navBtn, isFirst && styles.navBtnDisabled]}
              onPress={onBack}
              disabled={isFirst}
            >
              <AppText style={styles.navText}>{t.onboardingBack}</AppText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navBtn} onPress={onSkip}>
              <AppText style={styles.navTextSoft}>{t.onboardingSkip}</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navBtn, styles.navPrimary]}
              onPress={isLast ? onFinish : onNext}
            >
              <AppText style={styles.navTextPrimary}>
                {isLast ? t.onboardingFinish : t.onboardingNext}
              </AppText>
            </TouchableOpacity>
          </View>
        </Card>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({

  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    elevation: 50,
  },

  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,10,30,0.72)",
    zIndex: 50,
    elevation: 50,
  },

  dimBand: {
    position: "absolute",
    backgroundColor: "rgba(10,10,30,0.72)",
  },

  hole: {
    position: "absolute",
    borderWidth: 2,
    borderColor: NIGHT.yellow,
    borderRadius: 18,
  },

  bubbleWrap: {
    position: "absolute",
    left: 20,
    right: 20,
  },

  bubble: {
    padding: 18,
  },

  bubbleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  bubbleTitle: {
    marginLeft: 10,
    fontSize: 18,
    fontFamily: "Nunito_800ExtraBold",
    color: COLORS.text,
  },

  bubbleBody: {
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: NIGHT.lavenderDark,
    marginHorizontal: 4,
  },

  dotActive: {
    backgroundColor: NIGHT.end,
    width: 18,
  },

  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
  },

  navBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
  },

  navBtnDisabled: {
    opacity: 0.35,
  },

  navPrimary: {
    backgroundColor: NIGHT.end,
  },

  navText: {
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    color: COLORS.text,
  },

  navTextSoft: {
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
    color: COLORS.textSecondary,
  },

  navTextPrimary: {
    fontSize: 14,
    fontFamily: "Nunito_800ExtraBold",
    color: "#FFFFFF",
  },

});
