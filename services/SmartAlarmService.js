import { NativeModules } from "react-native";
import { getSmartAlarmSettings, saveSmartAlarmSettings } from "../storage/SmartAlarmStorage";

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

export async function getSmartAlarmConfig() {
  return getSmartAlarmSettings();
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

// Verifica si estamos dentro de ventana [target-windowMin, target]
// target es hoy o mañana según hora actual (si ya pasó target de hoy, es mañana)
export function isInWakeWindow(nowMs, { hour, minute, windowMin }) {
  const now = new Date(nowMs);
  const target = new Date(now);
  target.setHours(hour, minute, 0, 0);
  if (target.getTime() <= nowMs) {
    // ya pasó hoy, ventana es mañana
    return false;
  }
  const windowStart = target.getTime() - windowMin * 60 * 1000;
  return nowMs >= windowStart && nowMs <= target.getTime();
}

export function getWakeWindowRange({ hour, minute, windowMin }) {
  const now = new Date();
  const target = new Date(now);
  target.setHours(hour, minute, 0, 0);
  if (target.getTime() <= Date.now()) target.setDate(target.getDate() + 1);
  const start = new Date(target.getTime() - windowMin * 60 * 1000);
  return { start, target };
}
