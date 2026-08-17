import { StyleSheet } from "react-native";
import {
  COLORS,
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
    backgroundColor: NIGHT.lavender,
    borderRadius: 28,
    padding: 18,
    marginBottom: 18,
    ...SHADOW.card,
  },

  petImage: {
    width: 130,
    height: 130,
    resizeMode: "contain",
    marginRight: 12,
  },

  petInfo: {
    flex: 1,
  },

  petName: {
    fontSize: 24,
    fontFamily: "Nunito_800ExtraBold",
    color: COLORS.text,
  },

  dialogBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
  },

  dialogText: {
    fontSize: 13,
    color: COLORS.textSecondary,
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
    color: "#6C63A8",
  },

  // Stats

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  statCard: {
    width: "48%",
    ...NIGHT_STYLES.cardWhite,
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
    color: "#8A7FD6",
    letterSpacing: 1,
  },

  statValue: {
    fontSize: 32,
    fontFamily: "Nunito_800ExtraBold",
    color: COLORS.text,
    marginTop: 4,
  },

  statUnit: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: "Nunito_600SemiBold",
    marginTop: 2,
  },

  // Nivel

  levelCard: {
    ...NIGHT_STYLES.cardWhite,
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
    color: COLORS.text,
  },

  levelXp: {
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    color: COLORS.textSecondary,
  },

  levelHint: {
    marginTop: 10,
    fontSize: 13,
    color: COLORS.textSecondary,
    fontFamily: "Nunito_400Regular",
  },

  // Última noche

  lastNightCard: {
    ...NIGHT_STYLES.cardWhite,
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
    color: COLORS.text,
    letterSpacing: 1,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCF5E3",
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
    color: "#2E7D32",
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
    color: COLORS.text,
  },

  lastNightLabel: {
    fontSize: 11,
    fontFamily: "Nunito_700Bold",
    color: "#8A7FD6",
    marginTop: 2,
    letterSpacing: 1,
  },

  lastNightDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#EEE7FB",
  },

  lastNightEmpty: {
    textAlign: "center",
    fontSize: 14,
    color: COLORS.textSecondary,
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

  // Navegación inferior

  bottomNav: {
    ...NIGHT_STYLES.bottomNav,
  },

});

export default styles;