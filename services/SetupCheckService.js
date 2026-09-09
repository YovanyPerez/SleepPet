import { Platform, PermissionsAndroid } from "react-native";
import { isAccessibilityEnabled } from "./AccessibilityListener";
import { getNotificationStatus } from "./NotificationService";

// Chequeos BLOQUEANTES para iniciar una sesión (los opcionales —recordatorio,
// SmartAlarm— nunca bloquean). Reutilizado por SleepModeScreen y SleepSetupScreen
// para no duplicar la lógica de handleStartSleep.
// Devuelve array con claves pendientes: [] = todo listo.
export async function getMissingSetup() {
  const missing = [];

  try {
    const enabled = await isAccessibilityEnabled();
    if (!enabled) missing.push("accessibility");
  } catch (e) {
    missing.push("accessibility");
  }

  try {
    if (Platform.OS === "android" && Platform.Version >= 33) {
      const has = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (!has) missing.push("notifications");
    } else {
      const status = await getNotificationStatus();
      if (!status?.notificationsEnabled) missing.push("notifications");
    }
  } catch (e) {
    missing.push("notifications");
  }

  return missing;
}
