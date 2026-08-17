import { StyleSheet } from "react-native";
import {
  NIGHT,
  NIGHT_STYLES,
} from "../../constants/theme";

const styles = StyleSheet.create({

  safe: {
    ...NIGHT_STYLES.safe,
  },

  content: {
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 30,
  },

  // Cápsula de estado

  pill: {
    ...NIGHT_STYLES.pill,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },

  pillActive: {
    backgroundColor: "rgba(90,200,120,0.16)",
    borderColor: "rgba(120,220,150,0.45)",
  },

  pillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ADE80",
    marginRight: 6,
  },

  pillText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    marginLeft: 6,
  },

  // Título

  title: {
    ...NIGHT_STYLES.titleWhite,
    fontSize: 34,
    marginTop: 24,
  },

  subtitle: {
    ...NIGHT_STYLES.subtitleWhite,
    color: "rgba(255,255,255,0.72)",
    fontSize: 15,
    marginTop: 6,
    textAlign: "center",
  },

  // Contador

  timer: {
    color: "#F1EEFB",
    fontSize: 52,
    fontFamily: "Nunito_800ExtraBold",
    letterSpacing: 2,
    marginTop: 34,
    textShadowColor: "rgba(255,255,255,0.25)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },

  timeLabels: {
    flexDirection: "row",
    marginTop: 6,
  },

  timeLabel: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    fontFamily: "Nunito_600SemiBold",
    marginHorizontal: 18,
  },

  // Indicador de tracking

  trackingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },

  trackingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ADE80",
    marginRight: 8,
  },

  trackingText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    fontFamily: "Nunito_600SemiBold",
  },

  // Tarjetas

  cardFade: {
    width: "100%",
    alignItems: "center",
  },

  glassCard: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.68)",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.85)",
    padding: 22,
    alignItems: "center",
    marginTop: 26,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },

  cardHeader: {
    ...NIGHT_STYLES.headerRow,
    marginBottom: 14,
  },

  cardIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    ...NIGHT_STYLES.center,
    marginRight: 10,
  },

  cardTitle: {
    color: "#4A3F8F",
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
    letterSpacing: 1,
  },

  cardValue: {
    color: "#1B1B4B",
    fontSize: 46,
    fontFamily: "Nunito_800ExtraBold",
    marginVertical: 4,
  },

  cardHint: {
    color: "#6A5FAF",
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
  },

  // Motivacional

  motivationalCard: {
    marginTop: 16,
    paddingVertical: 20,
  },

  motivationalTitle: {
    color: "#4A3F8F",
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
    marginTop: 8,
  },

  motivationalText: {
    color: "#6A5FAF",
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    marginTop: 4,
  },

  // Botón principal

  mainButton: {
    width: "88%",
    backgroundColor: NIGHT.end,
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 28,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },

  mainButtonTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Nunito_800ExtraBold",
    letterSpacing: 1,
    marginTop: 6,
  },

  mainButtonSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    marginTop: 4,
  },

  // Logs

  logsLink: {
    marginTop: 20,
    padding: 8,
  },

  logsText: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    fontFamily: "Nunito_600SemiBold",
    textDecorationLine: "underline",
  },

});

export default styles;