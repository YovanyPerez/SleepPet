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