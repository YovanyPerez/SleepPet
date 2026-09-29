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

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Nunito_800ExtraBold",
    marginTop: 6,
    marginBottom: 10,
  },

  shopRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(150,130,255,0.25)",
    borderRadius: 22,
    padding: 12,
    marginBottom: 12,
  },

  shopIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.12)",
    ...NIGHT_STYLES.center,
    marginRight: 12,
  },

  shopInfo: {
    flex: 1,
    marginRight: 8,
  },

  shopName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Nunito_800ExtraBold",
  },

  shopDesc: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12.5,
    fontFamily: "Nunito_400Regular",
    marginTop: 2,
  },

  shopExtra: {
    color: NIGHT.yellow,
    fontSize: 12,
    fontFamily: "Nunito_700Bold",
    marginTop: 2,
  },

  shopBuy: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: NIGHT.end,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  shopBuyIcon: {
    marginRight: 4,
  },

  shopBuyText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Nunito_800ExtraBold",
  },

});

export default styles;