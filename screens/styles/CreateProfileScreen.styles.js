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
    paddingHorizontal: 26,
    paddingVertical: 30,
  },

  stepPill: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginBottom: 36,
  },

  stepText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
  },

  title: {
    ...NIGHT_STYLES.titleWhite,
    fontSize: 26,
    textAlign: "center",
    marginBottom: 26,
  },

  pet: {
    width: 150,
    height: 150,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 20,
  },

  input: {
    ...NIGHT_STYLES.inputGlass,
    padding: 16,
    marginBottom: 26,
  },

  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(150,130,255,0.2)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },

  optionSelected: {
    borderColor: NIGHT.yellow,
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.10)",
    ...NIGHT_STYLES.center,
    marginRight: 12,
  },

  optionText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Nunito_700Bold",
  },

  button: {
    marginTop: 26,
    ...NIGHT_STYLES.primaryButton,
    padding: 18,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  buttonDisabled: {
    opacity: 0.4,
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    fontFamily: "Nunito_800ExtraBold",
  },

});

export default styles;