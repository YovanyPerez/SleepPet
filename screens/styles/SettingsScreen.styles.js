import { StyleSheet } from "react-native";
import {
  COLORS,
  NIGHT,
  SHADOW,
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

  header: {
    ...NIGHT_STYLES.headerRow,
    marginBottom: 24,
  },

  headerIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.14)",
    ...NIGHT_STYLES.center,
    marginRight: 14,
  },

  headerText: {
    flex: 1,
  },

  title: {
    ...NIGHT_STYLES.titleWhite,
    fontSize: 32,
  },

  subtitle: {
    ...NIGHT_STYLES.subtitleWhite,
    color: "rgba(255,255,255,0.75)",
    fontSize: 16,
    marginTop: 2,
  },

  card: {
    borderRadius: 26,
  },

  cardHeaderRow: {
    ...NIGHT_STYLES.headerRow,
  },

  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EDEBFF",
    ...NIGHT_STYLES.center,
  },

  cardHeaderText: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  cardTitle: {
    fontSize: 18,
    fontFamily: "Nunito_700Bold",
    color: COLORS.text,
  },

  cardDesc: {
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  buttons: {
    flexDirection: "row",
    marginTop: 18,
  },

  languageButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F0F5",
    padding: 14,
    borderRadius: 14,
    marginHorizontal: 5,
  },

  selectedButton: {
    backgroundColor: NIGHT.end,
  },

  buttonText: {
    color: "#9AA0B8",
    fontSize: 15,
    fontFamily: "Nunito_700Bold",
  },

  buttonTextSelected: {
    color: "#FFFFFF",
  },

  buttonCheck: {
    marginLeft: 5,
  },

  timeContainer: {
    marginTop: 18,
  },

  timeLabels: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },

  timeFieldLabel: {
    width: 62,
    textAlign: "center",
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
    color: COLORS.textSecondary,
  },

  timeLabelsSpacer: {
    width: 28,
  },

  timePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0EFFF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  timeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: NIGHT.end,
    ...NIGHT_STYLES.center,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  timeBtnText: {
    color: "white",
    fontSize: 22,
    fontFamily: "Nunito_700Bold",
  },

  timeValues: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  timeField: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },

  timeFieldActive: {
    backgroundColor: "#DCD7FF",
  },

  timeValue: {
    minWidth: 40,
    textAlign: "center",
    fontSize: 28,
    fontFamily: "Nunito_800ExtraBold",
    color: COLORS.text,
  },

  timeColon: {
    fontSize: 24,
    fontFamily: "Nunito_700Bold",
    color: COLORS.textSecondary,
    marginHorizontal: 4,
  },

  motivationalBox: {
    backgroundColor: "#11154A",
    borderRadius: 20,
    padding: 18,
    alignItems: "center",
    marginTop: 18,
  },

  motivationalIcon: {
    marginBottom: 6,
  },

  motivationalTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Nunito_800ExtraBold",
    textAlign: "center",
  },

  motivationalMessage: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    marginTop: 4,
  },

  exactAlarmLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    padding: 6,
  },

  exactAlarmIcon: {
    marginRight: 6,
  },

  exactAlarmText: {
    color: NIGHT.yellow,
    fontSize: 13,
    fontFamily: "Nunito_700Bold",
    textDecorationLine: "underline",
  },

  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    ...SHADOW.card,
  },

  resetCircle: {
    backgroundColor: "#FFE3EA",
  },

  optionText: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  optionTitle: {
    fontSize: 17,
    fontFamily: "Nunito_700Bold",
    color: COLORS.text,
  },

  optionDesc: {
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  bottomNav: {
    ...NIGHT_STYLES.bottomNav,
  },

});

export default styles;