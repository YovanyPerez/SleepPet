import React from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const ICONS = {
  store: { family: "mci", name: "store" },
  menu: { family: "io", name: "menu" },
  streak: { family: "mci", name: "fire" },
  coins: { family: "mci", name: "cash" },
  level: { family: "io", name: "star" },
  sleep: { family: "io", name: "moon" },
  score: { family: "mci", name: "percent" },
  unlocks: { family: "io", name: "phone-portrait" },
  night: { family: "mci", name: "weather-night" },
  happiness: { family: "io", name: "heart" },
  check: { family: "io", name: "checkmark" },
  home: { family: "io", name: "home" },
  statistics: { family: "io", name: "bar-chart" },
  achievements: { family: "io", name: "trophy" },
  settings: { family: "io", name: "settings" },
};

export default function AppIcon({
  name,
  size = 22,
  color = "#000",
  style,
}) {
  const spec = ICONS[name];
  if (!spec) return null;

  const Component =
    spec.family === "mci"
      ? MaterialCommunityIcons
      : Ionicons;

  return (
    <Component
      name={spec.name}
      size={size}
      color={color}
      style={style}
    />
  );
}
