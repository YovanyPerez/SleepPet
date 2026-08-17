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
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  headerRow: {
    ...NIGHT_STYLES.headerRow,
    marginBottom: 20,
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
    marginHorizontal: 10,
  },

  title: {
    ...NIGHT_STYLES.titleWhite,
    fontSize: 28,
  },

  subtitle: {
    ...NIGHT_STYLES.subtitleWhite,
    fontSize: 14,
    marginTop: 2,
  },

  list: {
    paddingBottom: 30,
  },

  emptyCard: {
    alignItems: "center",
    marginTop: 40,
    paddingHorizontal: 24,
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
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    marginTop: 6,
  },

});

export default styles;