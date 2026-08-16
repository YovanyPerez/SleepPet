import { NativeModules } from "react-native";

const { ReminderModule } = NativeModules;

export function scheduleReminder(
  hour,
  minute,
  channelName,
  channelDescription,
  title,
  content
) {
  ReminderModule?.schedule(
    hour,
    minute,
    channelName,
    channelDescription,
    title,
    content
  );
}

export function cancelReminder() {
  ReminderModule?.cancel();
}

export function canScheduleExact() {
  return ReminderModule?.canScheduleExact?.();
}

export function openExactAlarmSettings() {
  ReminderModule?.openExactAlarmSettings?.();
}
