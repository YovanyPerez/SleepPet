import { NativeModules } from "react-native";

const { ReminderModule } = NativeModules;

export function scheduleReminder(
  hour,
  minute,
  channelName,
  channelDescription,
  title,
  content,
  followUpTitle,
  followUpContent
) {
  ReminderModule?.schedule(
    hour,
    minute,
    channelName,
    channelDescription,
    title,
    content,
    followUpTitle ?? title,
    followUpContent ?? content
  );
}

export function cancelReminder() {
  ReminderModule?.cancel();
}

export function setSleepActive(active) {
  ReminderModule?.setSleepActive?.(active);
}

export function canScheduleExact() {
  return ReminderModule?.canScheduleExact?.();
}

export function openExactAlarmSettings() {
  ReminderModule?.openExactAlarmSettings?.();
}
