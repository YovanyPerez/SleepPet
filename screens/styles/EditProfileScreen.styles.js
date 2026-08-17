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
    paddingTop: 16,
    paddingBottom: 40,
  },

  headerRow: {
    ...NIGHT_STYLES.headerRow,
    marginBottom: 22,
  },

  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    ...NIGHT_STYLES.center,
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
  },

  title: {
    ...NIGHT_STYLES.titleWhite,
    fontSize: 30,
  },

  subtitle: {
    ...NIGHT_STYLES.subtitleWhite,
    fontSize: 14,
    marginTop: 2,
  },

  introCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(150,130,255,0.25)",
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
  },

  introIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    ...NIGHT_STYLES.glassIconCircle,
    marginRight: 12,
  },

  introText: {
    flex: 1,
  },

  introTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "Nunito_800ExtraBold",
  },

  introDesc: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    marginTop: 3,
  },

  glassCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(150,130,255,0.20)",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
  },

  fieldHeader: {
    ...NIGHT_STYLES.headerRow,
    marginBottom: 12,
  },

  fieldIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    ...NIGHT_STYLES.glassIconCircle,
    marginRight: 10,
  },

  fieldLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
  },

  fieldDesc: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    marginBottom: 12,
  },

  input: {
    ...NIGHT_STYLES.inputGlass,
  },

  goalRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  goalInput: {
    flex: 1,
  },

  goalUnit: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 15,
    fontFamily: "Nunito_600SemiBold",
    marginLeft: 12,
  },

  recommended: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 15,
  },

  recommendedIcon: {
    marginRight: 6,
  },

  recommendedText: {
    color: "#C9C4E8",
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
  },

  goalCard: {
    alignItems: "center",
    borderRadius: 26,
    padding: 22,
    marginBottom: 20,
    marginTop: 4,
    ...NIGHT_STYLES.buttonShadow,
  },

  goalDecorRow: {
    ...NIGHT_STYLES.headerRow,
    marginBottom: 8,
  },

  goalDecorIcon: {
    marginRight: 6,
  },

  goalCardTitle: {
    color: NIGHT.yellow,
    fontSize: 16,
    fontFamily: "Nunito_800ExtraBold",
    letterSpacing: 1,
  },

  goalCardValue: {
    color: "#FFFFFF",
    fontSize: 26,
    fontFamily: "Nunito_800ExtraBold",
    marginTop: 6,
  },

  goalCardMessage: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    marginTop: 6,
  },

  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: NIGHT.end,
    borderRadius: 24,
    height: 60,
    ...NIGHT_STYLES.buttonShadow,
  },

  saveIcon: {
    marginRight: 8,
  },

  saveText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Nunito_800ExtraBold",
  },

  cancelButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1.5,
    borderColor: "rgba(150,130,255,0.4)",
    borderRadius: 26,
    height: 56,
    marginTop: 14,
  },

  cancelText: {
    color: "#D5CFF5",
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
  },

});

export default styles;