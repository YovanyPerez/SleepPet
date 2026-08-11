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
