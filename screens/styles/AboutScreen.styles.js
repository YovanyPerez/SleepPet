import { StyleSheet } from "react-native";
import {
  NIGHT_STYLES,
} from "../../constants/theme";

const styles = StyleSheet.create({

  safe: {
    ...NIGHT_STYLES.safe,
  },

  wrap: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
  },

  headerRow: {
    width: "100%",
    ...NIGHT_STYLES.headerBetween,
    marginBottom: 18,
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

  title: {
    ...NIGHT_STYLES.titleWhite,
    fontSize: 28,
  },

  glassCard: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(150,130,255,0.2)",
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    marginTop: 18,
  },

  label: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
    marginBottom: 6,
  },

  value: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "Nunito_800ExtraBold",
  },

});

export default styles;