import { StyleSheet } from "react-native";
import {
  NIGHT,
  NIGHT_STYLES,
} from "../../constants/theme";

const styles = StyleSheet.create({

  safe: {
    ...NIGHT_STYLES.safe,
  },

  wrap: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  header: {
    marginBottom: 18,
  },

  headerRow: {
    ...NIGHT_STYLES.headerRow,
  },

  headerIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.12)",
    ...NIGHT_STYLES.center,
    marginRight: 12,
  },

  headerText: {
    flex: 1,
  },

  title: {
    ...NIGHT_STYLES.titleWhite,
    fontSize: 26,
  },

  subtitle: {
    ...NIGHT_STYLES.subtitleWhite,
    fontSize: 13,
    marginTop: 2,
  },

  coinsCapsule: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,201,40,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,201,40,0.4)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  coinsIcon: {
    marginRight: 6,
  },

  coinsValue: {
    color: NIGHT.yellow,
    fontSize: 15,
    fontFamily: "Nunito_800ExtraBold",
  },

  list: {
    paddingBottom: 120,
  },

  bottomNav: {
    ...NIGHT_STYLES.bottomNav,
  },

});

export default styles;