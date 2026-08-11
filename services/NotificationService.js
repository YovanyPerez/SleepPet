import { NativeModules } from "react-native";

const { NotificationModule } = NativeModules;

export function startNotification(
  startTime,
  channel,
  channelDescription,
  title,
  running,
  time,
  unlocks
) {
  NotificationModule?.startNotification(
    startTime,
    channel,
    channelDescription,
    title,
    running,
    time,
    unlocks
  );
}

export function updateUnlocks(count) {
  NotificationModule?.updateUnlocks(count);
}

export function stopNotification() {
  NotificationModule?.stopNotification();
}

export function openNotificationSettings() {
  NotificationModule?.openNotificationSettings();
}

export function getNotificationStatus() {
  return NotificationModule?.getNotificationStatus();
}