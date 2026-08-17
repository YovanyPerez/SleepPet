import { StyleSheet } from "react-native";
import {
  NIGHT_STYLES,
} from "../../constants/theme";

const styles = StyleSheet.create({

  safe: {
    ...NIGHT_STYLES.safe,
  },

  content: {
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 40,
  },

  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  empty: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 20,
    fontFamily: "Nunito_700Bold",
  },

  title: {
    ...NIGHT_STYLES.titleWhite,
    fontSize: 28,
    textAlign: "center",
    marginBottom: 14,
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

  metricCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(150,130,255,0.2)",
    borderRadius: 22,
    padding: 14,
    marginBottom: 14,
  },

  metricIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.10)",
    ...NIGHT_STYLES.center,
    marginRight: 12,
  },

  metricLabel: {
    flex: 1,
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
  },

  metricValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Nunito_800ExtraBold",
  },

  rewardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 18,
    marginTop: 4,
  },

  rewardCard: {
    width: "48%",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(150,130,255,0.2)",
    borderRadius: 22,
    padding: 18,
  },

  rewardIcon: {
    marginBottom: 6,
  },

  rewardValue: {
    color: "#FFFFFF",
    fontSize: 26,
    fontFamily: "Nunito_800ExtraBold",
  },

  rewardLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
    marginTop: 4,
  },

  levelUpCard: {
    width: "100%",
    alignItems: "center",
    backgroundColor: "rgba(255,209,102,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,209,102,0.4)",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },

  levelUpIcon: {
    marginBottom: 6,
  },

  levelUpTitle: {
    color: "#FFD166",
    fontSize: 24,
    fontFamily: "Nunito_800ExtraBold",
    marginBottom: 4,
  },

  levelUpText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Nunito_600SemiBold",
    textAlign: "center",
    marginTop: 2,
  },

  button: {
    ...NIGHT_STYLES.primaryButton,
    paddingHorizontal: 56,
    paddingVertical: 17,
    borderRadius: 24,
    ...NIGHT_STYLES.buttonShadow,
    marginTop: 4,
  },

  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Nunito_800ExtraBold",
  },

});

export default styles;