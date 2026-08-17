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
    paddingBottom: 120,
  },

  trophyCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  title: {
    ...NIGHT_STYLES.titleWhite,
    fontSize: 34,
    textAlign: "center",
    marginTop: 16,
  },

  subtitle: {
    ...NIGHT_STYLES.subtitleWhite,
    color: "rgba(255,255,255,0.75)",
    fontSize: 16,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
  },

  emptyCard: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginTop: 24,
  },

  emptyIcon: {
    marginBottom: 10,
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontFamily: "Nunito_800ExtraBold",
    textAlign: "center",
  },

  emptyMessage: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    marginTop: 6,
  },

  list: {
    width: "100%",
    marginTop: 16,
  },

  bottomNav: {
    ...NIGHT_STYLES.bottomNav,
  },

});

export default styles;