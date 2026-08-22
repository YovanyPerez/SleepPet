import { StyleSheet } from "react-native";
import { NIGHT, NIGHT_STYLES } from "../../constants/theme";

const styles = StyleSheet.create({
  safe: {
    ...NIGHT_STYLES.safe,
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 40,
    width: "100%",
  },
  backButton: {
    alignSelf: "flex-start",
    padding: 8,
  },
  title: {
    ...NIGHT_STYLES.titleWhite,
    fontSize: 26,
    marginTop: 6,
    textAlign: "center",
  },
  subtitle: {
    ...NIGHT_STYLES.subtitleWhite,
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 12,
  },

  // Circulo de camara con anillo de estado
  circleWrap: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 4,
    overflow: "hidden",
    marginTop: 18,
    backgroundColor: "#111122",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  circleCam: {
    width: "100%",
    height: "100%",
  },
  circlePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  heartOverlay: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    alignItems: "center",
  },

  // Pulso en vivo
  liveLabel: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    fontFamily: "Nunito_600SemiBold",
    marginTop: 14,
    letterSpacing: 1,
  },
  liveBpm: {
    color: "#FFFFFF",
    fontSize: 56,
    fontFamily: "Nunito_800ExtraBold",
    lineHeight: 62,
    textShadowColor: "rgba(255,255,255,0.25)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  liveUnit: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    fontFamily: "Nunito_600SemiBold",
  },

  // Sparkline de senal
  sparkRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    height: 40,
    marginTop: 12,
    gap: 2,
  },
  sparkBar: {
    width: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(234,230,247,0.75)",
  },

  // Progreso
  progressCard: {
    width: "100%",
    marginTop: 14,
    backgroundColor: "rgba(255,255,255,0.68)",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.85)",
  },
  progressBarBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(27,27,75,0.15)",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: NIGHT.end,
  },
  progressText: {
    color: "#4A3F8F",
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    textAlign: "center",
    marginTop: 8,
  },
  debugText: {
    color: "rgba(74,63,143,0.55)",
    fontSize: 11,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    marginTop: 4,
  },

  // Resultado final
  bpmCard: {
    width: "100%",
    marginTop: 14,
    backgroundColor: "rgba(255,255,255,0.68)",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.85)",
    alignItems: "center",
  },
  bpmValue: {
    color: "#1B1B4B",
    fontSize: 34,
    fontFamily: "Nunito_800ExtraBold",
  },
  bpmLabel: {
    color: "#6A5FAF",
    fontSize: 12,
    fontFamily: "Nunito_600SemiBold",
    marginTop: 4,
  },

  // Recomendacion
  recCard: {
    width: "100%",
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.68)",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.85)",
  },
  recTitle: {
    fontSize: 15,
    fontFamily: "Nunito_800ExtraBold",
    marginBottom: 6,
  },
  recMessage: {
    color: "#4A3F8F",
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
  },

  // Botones
  buttonRow: {
    flexDirection: "row",
    width: "100%",
    marginTop: 16,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: NIGHT.end,
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Nunito_800ExtraBold",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  secondaryButtonWide: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  secondaryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
  },
  disabledButton: {
    opacity: 0.45,
  },

  errorText: {
    color: "#EF476F",
    fontSize: 12,
    fontFamily: "Nunito_600SemiBold",
    textAlign: "center",
    marginTop: 8,
  },
  disclaimer: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    marginTop: 14,
    paddingHorizontal: 12,
  },
});

export default styles;
