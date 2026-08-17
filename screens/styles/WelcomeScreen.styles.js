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
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  title: {
    ...NIGHT_STYLES.titleWhite,
    fontSize: 32,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 12,
  },

  subtitle: {
    ...NIGHT_STYLES.subtitleWhite,
    color: "rgba(255,255,255,0.75)",
    fontSize: 17,
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 36,
  },

  languageContainer: {
    flexDirection: "row",
    marginBottom: 40,
  },

  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 999,
    marginHorizontal: 8,
  },

  selectedButton: {
    backgroundColor: NIGHT.end,
    borderColor: NIGHT.end,
  },

  languageText: {
    color: "rgba(255,255,255,0.8)",
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
  },

  languageTextActive: {
    color: "#FFFFFF",
  },

  languageCheck: {
    marginLeft: 6,
  },

  button: {
    backgroundColor: NIGHT.end,
    paddingHorizontal: 48,
    paddingVertical: 17,
    borderRadius: 26,
    ...NIGHT_STYLES.buttonShadow,
  },

  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Nunito_800ExtraBold",
  },

});

export default styles;