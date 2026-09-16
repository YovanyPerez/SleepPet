import { NativeModules } from "react-native";
import { saveSmartAlarmSettings } from "../storage/SmartAlarmStorage";

// Puente a nativo para que SleepForegroundService conozca ventana (SharedPreferences smart_alarm)
// Si no existe Módulo nativo, fallback JS solo guarda AsyncStorage (alarma normal a targetTime)
const SmartAlarmModule = NativeModules.SmartAlarmModule;

export async function setSmartAlarmConfig({ enabled, hour, minute, windowMin }) {
  const next = { enabled: !!enabled, hour, minute, windowMin };
  await saveSmartAlarmSettings(next);
  // Intenta sincronizar a nativo (si existe)
  try {
    if (SmartAlarmModule?.setConfig) {
      await SmartAlarmModule.setConfig(enabled, hour, minute, windowMin);
    }
  } catch (e) {
    console.log("SmartAlarmModule setConfig fallback", e?.message);
  }
  return next;
}

export async function getSmartAlarmLastInfo() {
  try {
    if (SmartAlarmModule?.getLastInfo) {
      const raw = await SmartAlarmModule.getLastInfo();
      return {
        lastTriggerMs: typeof raw?.lastTriggerMs === "number" ? raw.lastTriggerMs : 0,
        lastFavorableMs: typeof raw?.lastFavorableMs === "number" ? raw.lastFavorableMs : 0,
      };
    }
  } catch (e) {
    console.log("SmartAlarm getLastInfo fallback", e?.message);
  }
  return { lastTriggerMs: 0, lastFavorableMs: 0 };
}

export function stopSmartAlarm() {
  try {
    SmartAlarmModule?.stopAlarm?.();
  } catch (e) {}
}
