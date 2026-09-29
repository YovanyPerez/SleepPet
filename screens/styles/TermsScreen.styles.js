import { StyleSheet } from "react-native";
import {
  NIGHT_STYLES,
} from "../../constants/theme";

const styles = StyleSheet.create({

  safe: {
    ...NIGHT_STYLES.safe,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },

  title: {
    ...NIGHT_STYLES.titleWhite,
    fontSize: 28,
    textAlign: "center",
    marginBottom: 18,
  },

  card: {
    ...NIGHT_STYLES.glassCard,
    padding: 20,
    marginBottom: 18,
  },

  paragraph: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    lineHeight: 21,
    marginBottom: 12,
  },

  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    ...NIGHT_STYLES.glassCard,
    padding: 16,
    marginBottom: 18,
  },

  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 1,
  },

  checkboxOn: {
    backgroundColor: "#5E60CE",
    borderColor: "#5E60CE",
  },

  checkText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    lineHeight: 20,
  },

  continueButton: {
    ...NIGHT_STYLES.primaryButton,
    borderRadius: 28,
    paddingVertical: 18,
  },

  continueButtonDisabled: {
    opacity: 0.4,
  },

  continueText: {
    fontSize: 17,
    fontFamily: "Nunito_800ExtraBold",
    color: "#FFFFFF",
    letterSpacing: 1,
  },

  backButton: {
    alignItems: "center",
    marginTop: 14,
    paddingVertical: 10,
  },

  backText: {
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    color: "rgba(255,255,255,0.7)",
  },

});

export default styles;
