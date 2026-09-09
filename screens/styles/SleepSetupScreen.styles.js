import { StyleSheet } from "react-native";
import {
  NIGHT,
  NIGHT_STYLES,
  SHADOW,
} from "../../constants/theme";

const styles = StyleSheet.create({

  safe: {
    ...NIGHT_STYLES.safe,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },

  header: {
    ...NIGHT_STYLES.headerRow,
    marginBottom: 8,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.14)",
    ...NIGHT_STYLES.center,
  },

  headerText: {
    flex: 1,
    marginLeft: 12,
  },

  title: {
    ...NIGHT_STYLES.titleWhite,
  },

  subtitle: {
    ...NIGHT_STYLES.subtitleWhite,
    marginTop: 4,
  },

  rowCard: {
    ...NIGHT_STYLES.glassCard,
    marginTop: 14,
  },

  rowHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  statusCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    ...NIGHT_STYLES.center,
    marginRight: 12,
  },

  statusOk: {
    backgroundColor: "rgba(76,175,80,0.25)",
  },

  statusPending: {
    backgroundColor: "rgba(255,183,3,0.25)",
  },

  rowTitleWrap: {
    flex: 1,
  },

  rowTitle: {
    fontSize: 16,
    fontFamily: "Nunito_800ExtraBold",
    color: "#FFFFFF",
  },

  rowBody: {
    marginTop: 10,
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    color: "rgba(255,255,255,0.75)",
    lineHeight: 19,
  },

  actionButton: {
    marginTop: 12,
    borderRadius: 16,
    paddingVertical: 12,
    backgroundColor: NIGHT.end,
    ...NIGHT_STYLES.center,
  },

  actionText: {
    fontSize: 14,
    fontFamily: "Nunito_800ExtraBold",
    color: "#FFFFFF",
  },

  switchRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  switchLabel: {
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    color: "#FFFFFF",
  },

  windowRow: {
    flexDirection: "row",
    marginTop: 12,
  },

  windowBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.14)",
    ...NIGHT_STYLES.center,
    marginHorizontal: 4,
  },

  windowBtnActive: {
    backgroundColor: NIGHT.yellow,
  },

  windowText: {
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    color: "#FFFFFF",
  },

  windowTextActive: {
    color: NIGHT.start,
  },

  doneBox: {
    ...NIGHT_STYLES.glassCard,
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  doneText: {
    marginLeft: 12,
    flex: 1,
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    color: "#FFFFFF",
  },

  continueButton: {
    ...NIGHT_STYLES.primaryButton,
    marginTop: 22,
    borderRadius: 28,
    paddingVertical: 20,
    ...SHADOW.card,
  },

  continueText: {
    fontSize: 18,
    fontFamily: "Nunito_800ExtraBold",
    color: "#FFFFFF",
    textAlign: "center",
  },

});

export default styles;
