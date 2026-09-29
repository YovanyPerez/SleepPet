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

  header: {
    ...NIGHT_STYLES.headerRow,
    marginBottom: 24,
  },

  headerIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.14)",
    ...NIGHT_STYLES.center,
    marginRight: 12,
  },

  headerText: {
    flex: 1,
  },

  title: {
    ...NIGHT_STYLES.titleWhite,
    fontSize: 30,
  },

  subtitle: {
    ...NIGHT_STYLES.subtitleWhite,
    color: "rgba(255,255,255,0.75)",
    fontSize: 15,
    marginTop: 2,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 6,
  },

  emptyCard: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginTop: 12,
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

  sleepStudySection: {
    marginTop: 8,
  },

  motivationWrap: {
    marginTop: 16,
  },

  lastNightCard: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 22,
    padding: 16,
    marginBottom: 6,
  },

  lastNightDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.14)",
    marginVertical: 12,
  },

  hipnoBars: {
    flexDirection: "row",
    height: 60,
    alignItems: "flex-end",
    gap: 2,
  },

  hipnoBar: {
    flex: 1,
    borderRadius: 2,
    opacity: 0.85,
  },

  hipnoLegend: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  hipnoLegendText: {
    fontSize: 11,
    fontFamily: "Nunito_700Bold",
  },

  hipnoDisclaimer: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 10,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    marginTop: 6,
  },

  phasesCard: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 22,
    padding: 16,
    marginBottom: 6,
  },

  phaseRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.10)",
  },

  phaseRowLast: {
    borderBottomWidth: 0,
  },

  phaseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },

  phaseLabel: {
    flex: 1,
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
  },

  phaseValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Nunito_800ExtraBold",
  },

  phasesSub: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontFamily: "Nunito_400Regular",
    textAlign: "right",
    marginTop: 4,
  },

  sleepStudyTier: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    fontFamily: "Nunito_700Bold",
    textAlign: "center",
    marginTop: 2,
    marginBottom: 10,
  },

  sleepStudyObs: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 16,
    padding: 14,
    marginTop: 4,
  },

  sleepStudyObsText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
    textAlign: "center",
  },

  sleepStudyDisclaimer: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontFamily: "Nunito_400Regular",
    textAlign: "center",
    marginTop: 10,
  },

});

export default styles;