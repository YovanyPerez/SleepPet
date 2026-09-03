import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "smart_alarm_settings";

// { enabled: boolean, hour: 0-23, minute: 0-59, windowMin: 15|30|45 }
const DEFAULTS = { enabled: false, hour: 7, minute: 0, windowMin: 30 };

export async function getSmartAlarmSettings() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return {
      enabled: typeof parsed.enabled === "boolean" ? parsed.enabled : DEFAULTS.enabled,
      hour: typeof parsed.hour === "number" ? parsed.hour : DEFAULTS.hour,
      minute: typeof parsed.minute === "number" ? parsed.minute : DEFAULTS.minute,
      windowMin: [15, 30, 45].includes(parsed.windowMin) ? parsed.windowMin : DEFAULTS.windowMin,
    };
  } catch (e) {
    return { ...DEFAULTS };
  }
}

export async function saveSmartAlarmSettings(settings) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(settings));
  } catch (e) {
    console.log("SmartAlarmStorage save error", e);
  }
}

export async function clearSmartAlarmSettings() {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch (e) {}
}
