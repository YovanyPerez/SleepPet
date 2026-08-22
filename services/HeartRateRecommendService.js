export function getHeartRateRecommendation(bpm, t) {
  if (bpm == null || !t) return null;

  if (bpm < 60) {
    return {
      key: "low",
      title: t.ppgRecLowTitle,
      message: t.ppgRecLowMessage,
      color: "#8FA3FF",
    };
  }
  if (bpm <= 100) {
    return {
      key: "normal",
      title: t.ppgRecNormalTitle,
      message: t.ppgRecNormalMessage,
      color: "#4CAF50",
    };
  }
  if (bpm <= 120) {
    return {
      key: "elevated",
      title: t.ppgRecElevatedTitle,
      message: t.ppgRecElevatedMessage,
      color: "#FFB703",
    };
  }
  return {
    key: "high",
    title: t.ppgRecHighTitle,
    message: t.ppgRecHighMessage,
    color: "#EF476F",
  };
}
