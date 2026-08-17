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
    paddingHorizontal: 24,
    paddingVertical: 24,
  },

  header: {
    alignItems: "center",
    marginBottom: 40,
  },

  headerIcon: {
    marginBottom: 10,
  },

  title: {
    ...NIGHT_STYLES.titleWhite,
    fontSize: 34,
  },

  subtitle: {
    ...NIGHT_STYLES.subtitleWhite,
    color: "rgba(255,255,255,0.72)",
    fontSize: 16,
    marginTop: 6,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    borderRadius: 28,
    padding: 20,
    marginBottom: 18,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  cardIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    ...NIGHT_STYLES.center,
    marginRight: 14,
  },

  cardText: {
    flex: 1,
    marginRight: 8,
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontFamily: "Nunito_800ExtraBold",
  },

  cardSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    marginTop: 3,
  },

  arrowButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(107,91,231,0.5)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    ...NIGHT_STYLES.center,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: NIGHT.end,
    borderRadius: 26,
    paddingVertical: 16,
    marginTop: 30,
    ...NIGHT_STYLES.buttonShadow,
  },

  backIcon: {
    marginRight: 8,
  },

  backText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "Nunito_800ExtraBold",
  },

});

export default styles;