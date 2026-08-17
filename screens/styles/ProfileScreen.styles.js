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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },

  header: {
    ...NIGHT_STYLES.headerRow,
    justifyContent: "center",
    marginBottom: 24,
  },

  headerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.12)",
    ...NIGHT_STYLES.center,
    marginRight: 12,
  },

  title: {
    ...NIGHT_STYLES.titleWhite,
    fontSize: 32,
  },

  petWrap: {
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 16,
  },

  petGlow: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(107,91,231,0.35)",
  },

  pet: {
    width: 170,
    height: 170,
    resizeMode: "contain",
  },

  glassCard: {
    ...NIGHT_STYLES.glassCard,
    marginBottom: 20,
  },

  userName: {
    color: "#FFFFFF",
    fontSize: 26,
    fontFamily: "Nunito_800ExtraBold",
    textAlign: "center",
  },

  userSubtitle: {
    ...NIGHT_STYLES.subtitleWhite,
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },

  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    ...NIGHT_STYLES.glassIconCircle,
  },

  infoText: {
    marginLeft: 12,
  },

  infoLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontFamily: "Nunito_600SemiBold",
  },

  infoValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Nunito_800ExtraBold",
    marginTop: 1,
  },

  rowDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.10)",
    marginVertical: 4,
  },

  xpBlock: {
    marginBottom: 18,
  },

  xpTop: {
    ...NIGHT_STYLES.headerBetween,
    marginBottom: 12,
  },

  xpLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  xpLevel: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Nunito_800ExtraBold",
    marginLeft: 10,
  },

  xpText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  gridTile: {
    width: "48%",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 18,
    paddingVertical: 16,
    marginBottom: 12,
  },

  gridIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.10)",
    ...NIGHT_STYLES.center,
    marginBottom: 8,
  },

  gridLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontFamily: "Nunito_600SemiBold",
    textAlign: "center",
  },

  gridValue: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "Nunito_800ExtraBold",
    marginTop: 2,
  },

  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: NIGHT.end,
    borderRadius: 24,
    height: 60,
    marginTop: 6,
    ...NIGHT_STYLES.buttonShadow,
  },

  editIcon: {
    marginRight: 8,
  },

  editText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Nunito_800ExtraBold",
  },

});

export default styles;