import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "smart_alarm_settings";

// { enabled: boolean, hour: 0-23, minute: 0-59, windowMin: 15|30|45, dismissMode: "off"|"word" }
const DEFAULTS = { enabled: false, hour: 7, minute: 0, windowMin: 30, dismissMode: "off" };

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
      dismissMode: parsed.dismissMode === "word" ? "word" : DEFAULTS.dismissMode,
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
