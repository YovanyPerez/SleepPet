export const COLORS = {
  primary: "#5E60CE",
  secondary: "#64DFDF",

  background: "#F5F7FB",
  surface: "#FFFFFF",

  text: "#1E293B",
  textSecondary: "#64748B",

  success: "#4CAF50",
  warning: "#FFB703",
  danger: "#EF476F",

  border: "#E2E8F0",
};

export const FONT = {
  title: 30,
  subtitle: 22,
  body: 18,
  small: 14,
};

export const SPACING = {
  xs: 5,
  sm: 10,
  md: 20,
  lg: 30,
  xl: 40,
};

export const BORDER_RADIUS = {
  small: 10,
  medium: 18,
  large: 25,
};

export const FONT_FAMILY = {
  regular: "Nunito_400Regular",
  semibold: "Nunito_600SemiBold",
  bold: "Nunito_700Bold",
  extraBold: "Nunito_800ExtraBold",
};

export const TEXT = {
  title: {
    fontFamily: FONT_FAMILY.extraBold,
    fontSize: FONT.title,
    fontWeight: "bold",
  },
  subtitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: FONT.subtitle,
    fontWeight: "600",
  },
  body: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT.body,
    fontWeight: "400",
  },
  small: {
    fontFamily: FONT_FAMILY.regular,
    fontSize: FONT.small,
    fontWeight: "400",
  },
};

export const SHADOW = {
  card: {
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
};

export const NIGHT = {
  start: "#1B1B4B",
  end: "#5E60CE",
  lavender: "#EAE6F7",
  lavenderSoft: "#F4F1FB",
  lavenderDark: "#C9B8E8",
  yellow: "#FFD166",
  pink: "#FF8FAB",
  textOnNight: "#FFFFFF",
  white: "#FFFFFF",
};

// Patrones reutilizables del tema nocturno.
// Las pantallas los importan y sobreescriben solo lo que difiere.
export const NIGHT_STYLES = {
  safe: {
    flex: 1,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  center: {
    alignItems: "center",
    justifyContent: "center",
  },

  titleWhite: {
    color: NIGHT.white,
    fontFamily: FONT_FAMILY.extraBold,
  },

  subtitleWhite: {
    color: "rgba(255,255,255,0.7)",
    fontFamily: FONT_FAMILY.regular,
  },

  glassCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 24,
    padding: 18,
  },

  cardWhite: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    ...SHADOW.card,
  },

  primaryButton: {
    backgroundColor: NIGHT.end,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonShadow: {
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },

  bottomNav: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 22,
  },

  inputGlass: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(150,130,255,0.35)",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 18,
    color: "#FFFFFF",
  },

  glassIconCircle: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
};