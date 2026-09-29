import { StyleSheet } from "react-native";
import {
  NIGHT,
  SHADOW,
  NIGHT_STYLES,
} from "../../constants/theme";

const styles = StyleSheet.create({

  content: {
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 130,
  },

  // Header

  header: {
    ...NIGHT_STYLES.headerBetween,
    marginBottom: 22,
  },

  headerCenter: {
    flex: 1,
    marginHorizontal: 15,
  },

  greeting: {
    fontSize: 17,
    fontFamily: "Nunito_600SemiBold",
    opacity: 0.9,
  },

  name: {
    fontSize: 26,
    fontFamily: "Nunito_800ExtraBold",
    marginTop: 2,
  },

  circleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    ...NIGHT_STYLES.center,
  },

  circleButtonPurple: {
    backgroundColor: NIGHT.end,
    elevation: 4,
  },

  headerSpacer: {
    width: 48,
    height: 48,
  },

  // Mascota

  petCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 28,
    padding: 18,
    marginBottom: 18,
  },

  petImageWrap: {
    width: 130,
    height: 130,
    marginRight: 12,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "rgba(27,27,75,0.55)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  petImageLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 130,
    height: 130,
    resizeMode: "contain",
  },

  petInfo: {
    flex: 1,
  },

  petName: {
    fontSize: 24,
    fontFamily: "Nunito_800ExtraBold",
    color: "#FFFFFF",
  },

  dialogBubble: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
  },

  dialogText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    fontFamily: "Nunito_600SemiBold",
  },

  happinessRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  happinessIcon: {
    marginRight: 5,
  },

  happiness: {
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    color: "rgba(255,255,255,0.8)",
  },

  // Stats

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  statCard: {
    width: "48%",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 26,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
  },

  statIcon: {
    marginBottom: 6,
  },

  statLabel: {
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
    color: "rgba(255,255,255,0.65)",
    letterSpacing: 1,
  },

  statValue: {
    fontSize: 32,
    fontFamily: "Nunito_800ExtraBold",
    color: "#FFFFFF",
    marginTop: 4,
  },

  statUnit: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    fontFamily: "Nunito_600SemiBold",
    marginTop: 2,
  },

  // Nivel

  levelCard: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 26,
    padding: 18,
    marginBottom: 18,
  },

  levelHeader: {
    ...NIGHT_STYLES.headerBetween,
    marginBottom: 14,
  },

  levelLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  levelIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: NIGHT.end,
    ...NIGHT_STYLES.center,
    marginRight: 12,
  },

  levelTitle: {
    fontSize: 20,
    fontFamily: "Nunito_800ExtraBold",
    color: "#FFFFFF",
  },

  levelXp: {
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    color: "rgba(255,255,255,0.65)",
  },

  levelHint: {
    marginTop: 10,
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    fontFamily: "Nunito_400Regular",
  },

  // Última noche

  lastNightCard: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 26,
    padding: 18,
    marginBottom: 18,
  },

  lastNightHeader: {
    ...NIGHT_STYLES.headerBetween,
    marginBottom: 16,
  },

  lastNightTitle: {
    fontSize: 14,
    fontFamily: "Nunito_800ExtraBold",
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 1,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74,222,128,0.16)",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  badgeIcon: {
    marginRight: 4,
  },

  badgeText: {
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
    color: "#4ADE80",
  },

  lastNightRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  lastNightStat: {
    flex: 1,
    alignItems: "center",
  },

  lastNightIcon: {
    marginBottom: 4,
  },

  lastNightValue: {
    fontSize: 20,
    fontFamily: "Nunito_800ExtraBold",
    color: "#FFFFFF",
  },

  lastNightLabel: {
    fontSize: 11,
    fontFamily: "Nunito_700Bold",
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
    letterSpacing: 1,
  },

  lastNightDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.14)",
  },

  lastNightEmpty: {
    textAlign: "center",
    fontSize: 14,
    color: "rgba(255,255,255,0.65)",
    fontFamily: "Nunito_600SemiBold",
    paddingVertical: 8,
  },

  // Botón principal

  startButton: {
    ...NIGHT_STYLES.primaryButton,
    borderRadius: 28,
    paddingVertical: 20,
    ...SHADOW.card,
  },

  startIcon: {
    marginBottom: 6,
  },

  startTitle: {
    fontSize: 22,
    fontFamily: "Nunito_800ExtraBold",
    color: "#FFFFFF",
    letterSpacing: 1,
  },

  startSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    fontFamily: "Nunito_400Regular",
    marginTop: 4,
  },

});

export default styles;